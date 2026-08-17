import { useState, useMemo } from 'react';
import { useObservations } from '../../../hooks/useObservations';
import { useEvolutionPatient } from '../../../hooks/useEvolutionPatient';
import type { Patient } from '../../../../core/entities/Patient';
import type { Observation, CreateObservationDTO, SignatureSection } from '../../../../core/entities/Observation';
import type { EvolutionPatient, CreateEvolutionPatientDTO } from '../../../../core/entities/EvolutionPatient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus, FileText, Stethoscope, Calendar, Clock, Download,
  FileArchive, ChevronDown, ChevronUp, Pencil, PenLine,
  RefreshCw} from 'lucide-react';
import AddObservationModal from './AddObservationModal';
import EditObservationModal from './EditObservationModal';
import AddEvolutionModal from './AddEvolutionModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { SignatureBadge } from '../../common/SignatureBadge';
import { toast } from 'sonner';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { Printer } from 'lucide-react';
import { printHTML } from '../../../../shared/utils/printUtils';
import { observationToHTML, patientHeaderHTML, footerHTML } from '../../../../shared/utils/printObservation';

import AjouterPieceJointeButton from '../../common/AjouterPieceJointeButton';

import QuickObservationAttachmentButton from './QuickObservationAttachmentButton';
interface ObservationsTabProps {
  patient: Patient;
}

// ── Affiche les signatures d'une section ──────────────────────────────────────
function SectionSignature({ sigs }: { sigs?: SignatureSection[] }) {
  if (!sigs || sigs.length === 0) return null;
  return (
    <div className="space-y-1 mt-1.5">
      {sigs.map((sig, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <PenLine className="w-3 h-3 shrink-0" />
          <span>
            <strong className="text-gray-500">{sig.medecin}</strong>
            {sig.role && <span className="text-gray-400 ml-1">({sig.role})</span>}
            {' '}— {new Date(sig.date).toLocaleDateString('fr-FR')} à {sig.heure}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Carte d'une mise à jour quotidienne ───────────────────────────────────────
function EvolutionCard({ evol }: { evol: EvolutionPatient }) {
  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-bold text-cyan-800">
          {new Date(evol.date_visite).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
        <span className="text-cyan-400">·</span>
        <span className="text-xs text-cyan-700">{evol.heure_visite}</span>
        <span className="text-cyan-400">·</span>
        <span className="text-xs font-semibold text-cyan-700 bg-white border border-cyan-200 px-2 py-0.5 rounded-full">
          Dr. {evol.medecin}
        </span>
      </div>

      {evol.resume_patient && (
        <div className="mb-2">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-0.5">Résumé</p>
          <p className="text-xs text-gray-800 whitespace-pre-line leading-relaxed">{evol.resume_patient}</p>
        </div>
      )}

      {evol.parametres && Object.values(evol.parametres).some(Boolean) && (
        <div className="mb-2">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-1.5">Paramètres</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { label: 'FC',      value: evol.parametres.frequence_cardiaque    ? `${evol.parametres.frequence_cardiaque} bpm`    : null },
              { label: 'T°',      value: evol.parametres.temperature            ? `${evol.parametres.temperature} °C`             : null },
              { label: 'FR',      value: evol.parametres.frequence_respiratoire ? `${evol.parametres.frequence_respiratoire} rpm`  : null },
              { label: 'SpO2',    value: evol.parametres.saturation_oxygene     ? `${evol.parametres.saturation_oxygene} %`       : null },
              { label: 'TA G',    value: evol.parametres.tension_arterielle_gauche },
              { label: 'TA D',    value: evol.parametres.tension_arterielle_droite },
              { label: 'Poids',   value: evol.parametres.poids                  ? `${evol.parametres.poids} kg`                   : null },
              { label: 'Diurèse', value: evol.parametres.diurese },
            ]
              .filter(({ value }) => !!value)
              .map(({ label, value }) => (
                <div key={label} className="bg-white border border-cyan-100 rounded px-2 py-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
                  <p className="text-xs font-semibold text-gray-800">{value}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {evol.traitement && (
        <div className="mb-2">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide mb-0.5">Traitement</p>
          <p className="text-xs text-gray-800 whitespace-pre-line">{evol.traitement}</p>
        </div>
      )}

      {(evol.problemes_poses || evol.cat) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {evol.problemes_poses && (
            <div className="bg-white border border-cyan-100 rounded p-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Problèmes posés</p>
              <p className="text-xs text-gray-800">{evol.problemes_poses}</p>
            </div>
          )}
          {evol.cat && (
            <div className="bg-white border border-cyan-100 rounded p-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">CAT</p>
              <p className="text-xs text-gray-800">{evol.cat}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ObservationsTab({ patient }: ObservationsTabProps) {
  const { observations, loading, error, createObservation, updateObservation } = useObservations(patient.id_patient);
  const { evolutions, createEvolution } = useEvolutionPatient(patient.id_patient);

  const [showAddModal,       setShowAddModal]       = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [addingEvolutionFor, setAddingEvolutionFor] = useState<Observation | null>(null);
  const [downloading,        setDownloading]        = useState<number | null>(null);
  const [downloadingAll,     setDownloadingAll]      = useState(false);
  const [expandedObs,        setExpandedObs]        = useState<number | null>(null);
  const [expandedEvolutions, setExpandedEvolutions] = useState<number | null>(null);

  const evolutionsByObs = useMemo(() => {
    const map = new Map<number, EvolutionPatient[]>();
    evolutions.forEach(e => {
      if (!map.has(e.id_observation)) map.set(e.id_observation, []);
      map.get(e.id_observation)!.push(e);
    });
    return map;
  }, [evolutions]);

  const isHospitalise = patient.statut_patient === 'hospitalise';

  const handleCreateObservation = async (data: CreateObservationDTO) => {
    await createObservation(data);
    setShowAddModal(false);
  };

  const handleUpdateObservation = async (id: number, data: Partial<CreateObservationDTO>) => {
    const ok = await updateObservation(id, data);
    if (ok) {
      toast.success('Observation modifiée avec succès !');
      setEditingObservation(null);
    } else {
      throw new Error('Erreur lors de la modification');
    }
  };

  const handleCreateEvolution = async (data: CreateEvolutionPatientDTO) => {
    const result = await createEvolution(data);
    if (!result) throw new Error('Erreur lors de la création de la mise à jour');
    toast.success('Mise à jour enregistrée !');
  };

  const toggleExpand     = (obsId: number) => setExpandedObs(expandedObs === obsId ? null : obsId);
  const toggleEvolutions = (obsId: number) => setExpandedEvolutions(expandedEvolutions === obsId ? null : obsId);

  const handleDownloadPDF = async (observationId: number) => {
    setDownloading(observationId);
    try {
      const response = await httpClient.get(`/observations/${observationId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `observation_${observationId}_${patient.nom_patient}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès !');
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAllZIP = async () => {
    if (observations.length === 0) { toast.error('Aucune observation à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/observations/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `observations_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${observations.length} observation(s) téléchargée(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Dans le composant ObservationsTab, après les states existants :
const handlePrintObservation = (obs: Observation) => {
  const obsEvolutions = evolutionsByObs.get(obs.id_observation) ?? [];
  const html = patientHeaderHTML(patient)
    + observationToHTML(obs, obsEvolutions)
    + footerHTML();
  printHTML(html, `Observation — ${patient.nom_patient} ${patient.prenom_patient}`);
};

const handlePrintAllObservations = () => {
  if (observations.length === 0) return;
  const obsHTML = observations.map(obs => {
    const obsEvolutions = evolutionsByObs.get(obs.id_observation) ?? [];
    return observationToHTML(obs, obsEvolutions);
  }).join('<hr class="obs-separator" />');
  const html = patientHeaderHTML(patient) + obsHTML + footerHTML();
  printHTML(html, `Observations — ${patient.nom_patient} ${patient.prenom_patient}`);
};

  if (loading && observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des observations...</p>
      </div>
    );
  }

  if (error && observations.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">❌ {error}</p>
        <p className="text-red-600 text-sm mt-1">Veuillez réessayer ou contacter l'administrateur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Observations médicales</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {observations.length === 0
              ? 'Aucune observation enregistrée'
              : `${observations.length} observation${observations.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {observations.length > 0 && (
            <button onClick={handleDownloadAllZIP} disabled={downloadingAll}
              title="Télécharger toutes les observations en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {downloadingAll
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>}
            </button>
          )}
          {observations.length > 0 && (
  <button onClick={handlePrintAllObservations}
    title="Imprimer toutes les observations"
    className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center justify-center gap-2 text-sm">
    <Printer className="w-4 h-4" />
    <span className="hidden sm:inline">Imprimer</span>
  </button>
)} 
            
          <QuickObservationAttachmentButton
  patientId={patient.id_patient}
  isHospitalise={isHospitalise}
  createObservation={createObservation}
/>

          <PermissionGuard permission="observations.write">
            <button onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle observation</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddObservationModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateObservation}
        />
      )}
      {editingObservation && (
        <EditObservationModal
          patient={patient}
          observation={editingObservation}
          onClose={() => setEditingObservation(null)}
          onSubmit={handleUpdateObservation}
        />
      )}
      {addingEvolutionFor && (
        <AddEvolutionModal
          patient={patient}
          observation={addingEvolutionFor}
          onClose={() => setAddingEvolutionFor(null)}
          onSubmit={handleCreateEvolution}
        />
      )}

      {/* État vide */}
      {observations.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucune observation enregistrée</h4>
          <p className="text-xs text-gray-500 mb-5">Les observations médicales du patient apparaîtront ici.</p>
          <PermissionGuard permission="observations.write">
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />Créer la première observation
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {observations.map((obs) => {
            const isExpanded     = expandedObs === obs.id_observation;
            const sigs           = (obs.signatures ?? {}) as Record<string, SignatureSection[]>;
            const obsEvolutions  = evolutionsByObs.get(obs.id_observation) ?? [];
            const isEvolExpanded = expandedEvolutions === obs.id_observation;

            return (
              <div key={obs.id_observation}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all border-l-4 border-l-cyan-500 p-4 sm:p-5">

                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1.5">
                        <Stethoscope className="w-3 h-3" />
                        {obs.type_observation === 'externe' ? 'Consultation' : 'Hospitalisation'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {format(new Date(obs.date_observation), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {obs.heure_observation}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <PermissionGuard permission="observations.write">
                      <button
                        onClick={() => setEditingObservation(obs)}
                        title="Modifier cette observation"
                        className="px-3 py-1.5 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-lg hover:bg-cyan-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs">
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Modifier</span>
                      </button>
                    </PermissionGuard>

                    <button
                      onClick={() => handleDownloadPDF(obs.id_observation)}
                      disabled={downloading === obs.id_observation}
                      title="Télécharger en PDF"
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                      {downloading === obs.id_observation
                        ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                        : <Download className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button
  onClick={() => handlePrintObservation(obs)}
  title="Imprimer cette observation"
  className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs">
  <Printer className="w-3.5 h-3.5" />
  <span className="hidden sm:inline">Imprimer</span>
</button>
                  </div>
                </div>

                {/* Résumé toujours visible */}
                <div className="space-y-3">
                  {(obs.motif_consultation || obs.motif_hospitalisation) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Motif</p>
                      <p className="text-sm text-gray-900 font-medium">{obs.motif_consultation || obs.motif_hospitalisation}</p>
                      <SectionSignature sigs={sigs.motif} />
                    </div>
                  )}
                  {obs.histoire_maladie && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Histoire de la maladie</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic border-l-2 border-gray-200 pl-3">
                        {obs.histoire_maladie}
                      </p>
                    </div>
                  )}
                </div>

                <SignatureBadge
                  nom={obs.medecin}
                  date={String(obs.date_observation)}
                  heure={obs.heure_observation}
                />

                <div className="mt-3 pt-3 border-t border-gray-100">
  <AjouterPieceJointeButton
    entiteType="observation"
    entiteId={obs.id_observation}
    patientId={patient.id_patient}
  />
</div>

                {/* Détails (accordion) */}
                {isExpanded && (
                  <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">

                    {/* Antécédents */}
                    {(obs.antecedents_cmo || obs.antecedents_gmo || obs.antecedents_che) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Antécédents</h4>
                        {obs.antecedents_cmo && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">CMO</p>
                            {obs.antecedents_cmo.chirurgicaux      && <p className="text-xs text-gray-700 ml-2">• Chirurgicaux : {obs.antecedents_cmo.chirurgicaux}</p>}
                            {obs.antecedents_cmo.medicaux           && <p className="text-xs text-gray-700 ml-2">• Médicaux : {obs.antecedents_cmo.medicaux}</p>}
                            {obs.antecedents_cmo.gyneco_obstetricaux && <p className="text-xs text-gray-700 ml-2">• Gynéco-obstétricaux : {obs.antecedents_cmo.gyneco_obstetricaux}</p>}
                          </div>
                        )}
                        {obs.antecedents_gmo && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">GMO</p>
                            {obs.antecedents_gmo.genetique && <p className="text-xs text-gray-700 ml-2">• Génétique : {obs.antecedents_gmo.genetique}</p>}
                            {obs.antecedents_gmo.mode_vie  && <p className="text-xs text-gray-700 ml-2">• Mode de vie : {obs.antecedents_gmo.mode_vie}</p>}
                          </div>
                        )}
                        {obs.antecedents_che && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">CHE</p>
                            {obs.antecedents_che.curriculum_vitae        && <p className="text-xs text-gray-700 ml-2">• Curriculum Vitae : {obs.antecedents_che.curriculum_vitae}</p>}
                            {obs.antecedents_che.hospitalisation          && <p className="text-xs text-gray-700 ml-2">• Hospitalisation : {obs.antecedents_che.hospitalisation}</p>}
                            {obs.antecedents_che.niveau_socio_economique && <p className="text-xs text-gray-700 ml-2">• Niveau socio-économique : {obs.antecedents_che.niveau_socio_economique}</p>}
                          </div>
                        )}
                        <SectionSignature sigs={sigs.antecedents} />
                      </div>
                    )}

                    {/* Examen général */}
                    {obs.examen_general && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Examen général</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: 'État général', value: obs.examen_general.etat_general },
                            { label: 'Température',  value: obs.examen_general.temperature ? `${obs.examen_general.temperature} °C` : null },
                            { label: 'FC',           value: obs.examen_general.frequence_cardiaque ? `${obs.examen_general.frequence_cardiaque} bpm` : null },
                            { label: 'TA G',         value: obs.examen_general.tension_arterielle_gauche ? `${obs.examen_general.tension_arterielle_gauche} mmHg` : null },
                            { label: 'TA D',         value: obs.examen_general.tension_arterielle_droite ? `${obs.examen_general.tension_arterielle_droite} mmHg` : null },
                            { label: 'SpO2',         value: obs.examen_general.saturation_oxygene ? `${obs.examen_general.saturation_oxygene} %` : null },
                            { label: 'Poids',        value: obs.examen_general.poids ? `${obs.examen_general.poids} kg` : null },
                            { label: 'IMC',          value: obs.examen_general.imc ? String(obs.examen_general.imc) : null },
                          ]
                            .filter(({ value }) => !!value)
                            .map(({ label, value }) => (
                              <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-gray-800">{value}</p>
                              </div>
                            ))}
                        </div>
                        <SectionSignature sigs={sigs.examen_general} />
                      </div>
                    )}

                    {/* Examen physique central */}
                    {obs.examen_physique_central && Object.values(obs.examen_physique_central).some(Boolean) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Examen physique central</h4>
                        <div className="space-y-1">
                          {[
                            { label: 'Choc de pointe',        value: obs.examen_physique_central.choc_pointe           },
                            { label: 'BDC',                   value: obs.examen_physique_central.bdc                   },
                            { label: 'Souffles',              value: obs.examen_physique_central.souffles              },
                            { label: 'Pouls périphériques',   value: obs.examen_physique_central.pouls_peripheriques   },
                            { label: 'Veines jugulaires',     value: obs.examen_physique_central.veines_jugulaires     },
                            { label: 'Appareil respiratoire', value: obs.examen_physique_central.appareil_respiratoire },
                            { label: 'Foie',                  value: obs.examen_physique_central.foie                  },
                          ].filter(({ value }) => !!value).map(({ label, value }) => (
                            <p key={label} className="text-xs text-gray-700">
                              <span className="font-semibold text-gray-500">{label} :</span> {value}
                            </p>
                          ))}
                        </div>
                        <SectionSignature sigs={sigs.examen_physique_central} />
                      </div>
                    )}

                    {/* Examen physique périphérique */}
                    {obs.examen_physique_peripherique && Object.values(obs.examen_physique_peripherique).some(Boolean) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Examen physique périphérique</h4>
                        <div className="space-y-1">
                          {[
                            { label: 'Conjonctives',        value: obs.examen_physique_peripherique.conjonctives_muqueuses  },
                            { label: 'Bucco-dentaire',      value: obs.examen_physique_peripherique.etat_bucco_dentaire     },
                            { label: 'Masse cervicale',     value: obs.examen_physique_peripherique.masse_cervicale         },
                            { label: 'Abdomen',             value: obs.examen_physique_peripherique.abdomen                 },
                            { label: 'Masse palpée',        value: obs.examen_physique_peripherique.masse_palpee            },
                            { label: 'Membres inf. (OMI)', value: obs.examen_physique_peripherique.membres_inferieurs_omi  },
                            { label: 'Mollets',             value: obs.examen_physique_peripherique.mollets                 },
                            { label: 'Extrémités',          value: obs.examen_physique_peripherique.extremites              },
                            { label: 'Autres',              value: obs.examen_physique_peripherique.autres                  },
                          ].filter(({ value }) => !!value).map(({ label, value }) => (
                            <p key={label} className="text-xs text-gray-700">
                              <span className="font-semibold text-gray-500">{label} :</span> {value}
                            </p>
                          ))}
                        </div>
                        <SectionSignature sigs={sigs.examen_physique_peripherique} />
                      </div>
                    )}

                    {/* Résumé syndromique */}
                    {obs.resume_syndromique && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Résumé syndromique</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{obs.resume_syndromique}</p>
                        <SectionSignature sigs={sigs.resume_syndromique} />
                      </div>
                    )}

                    {/* Hypothèses diagnostiques */}
                    {obs.hypotheses_diagnostiques && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Hypothèses diagnostiques</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{obs.hypotheses_diagnostiques}</p>
                        <SectionSignature sigs={sigs.hypotheses_diagnostiques} />
                      </div>
                    )}

                    {/* Résultats paracliniques */}
                    {obs.resultats_examens_paracliniques && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Résultats paracliniques</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{obs.resultats_examens_paracliniques}</p>
                        <SectionSignature sigs={sigs.resultats_examens_paracliniques} />
                      </div>
                    )}
                  </div>
                )}

                {/* Diagnostic + CAT — toujours visibles */}
                {(obs.diagnostic_retenu || obs.cat) && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    {obs.diagnostic_retenu && (
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Diagnostic retenu</p>
                        <p className="text-sm font-semibold text-green-900">{obs.diagnostic_retenu}</p>
                        <SectionSignature sigs={sigs.diagnostic_retenu} />
                      </div>
                    )}
                    {obs.cat && (
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Conduite à tenir</p>
                        <p className="text-sm text-gray-800">{obs.cat}</p>
                        <SectionSignature sigs={sigs.cat} />
                      </div>
                    )}
                  </div>
                )}

                {/* Bouton accordion */}
                <button
                  onClick={() => toggleExpand(obs.id_observation)}
                  className="mt-4 w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-gray-100">
                  {isExpanded
                    ? <><ChevronUp className="w-3.5 h-3.5" />Voir moins</>
                    : <><ChevronDown className="w-3.5 h-3.5" />Voir plus de détails</>}
                </button>

                {/* ── SECTION MISES À JOUR ── uniquement hospitalisé ── */}
                {isHospitalise && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <PermissionGuard permission="observations.write">
                      <button
                        onClick={() => setAddingEvolutionFor(obs)}
                        className="w-full py-2 text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed border-cyan-300">
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter une mise à jour
                      </button>
                    </PermissionGuard>

                    {obsEvolutions.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleEvolutions(obs.id_observation)}
                          className="w-full py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-gray-200">
                          <RefreshCw className="w-3 h-3" />
                          {isEvolExpanded ? 'Masquer' : 'Voir'} les mises à jour ({obsEvolutions.length})
                        </button>

                        {isEvolExpanded && (
                          <div className="mt-3 space-y-3 pl-3 border-l-2 border-cyan-200">
                            {obsEvolutions
                              .sort((a, b) => new Date(b.date_visite).getTime() - new Date(a.date_visite).getTime())
                              .map(evol => (
                                <EvolutionCard key={evol.id_evolution} evol={evol} />
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}