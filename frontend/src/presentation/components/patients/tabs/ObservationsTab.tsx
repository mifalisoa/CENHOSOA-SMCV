import { useState } from 'react';
import { useObservations } from '../../../hooks/useObservations';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, Stethoscope, Calendar, Clock, User, Download, FileArchive, ChevronDown, ChevronUp } from 'lucide-react';
import AddObservationModal from './AddObservationModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface ObservationsTabProps {
  patient: Patient;
}

export default function ObservationsTab({ patient }: ObservationsTabProps) {
  const { observations, loading, error, createObservation } = useObservations(patient.id_patient);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [downloading,    setDownloading]    = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [expandedObs,    setExpandedObs]    = useState<number | null>(null);

  const handleCreateObservation = async (data: CreateObservationDTO) => {
    await createObservation(data);
    setShowAddModal(false);
  };

  const toggleExpand = (obsId: number) => {
    setExpandedObs(expandedObs === obsId ? null : obsId);
  };

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

  // ── Chargement / erreur ───────────────────────────────────────────────────────

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

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
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
          {/* ZIP — visible pour tous */}
          {observations.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              title="Télécharger toutes les observations en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingAll
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>
              }
            </button>
          )}

          {/* ✅ Nouvelle observation — uniquement si permission write */}
          <PermissionGuard permission="observations.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle observation</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Modal ── */}
      {showAddModal && (
        <AddObservationModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateObservation}
        />
      )}

      {/* ── État vide ── */}
      {observations.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucune observation enregistrée</h4>
          <p className="text-xs text-gray-500 mb-5">Les observations médicales du patient apparaîtront ici.</p>
          {/* ✅ Créer la première — uniquement si permission write */}
          <PermissionGuard permission="observations.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer la première observation
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {observations.map((obs) => {
            const isExpanded = expandedObs === obs.id_observation;

            return (
              <div
                key={obs.id_observation}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all border-l-4 border-l-cyan-500"
              >
                <div className="p-4 sm:p-5">

                  {/* ── En-tête ── */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Badge type — gris neutre pour les deux types */}
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
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {obs.medecin}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* PDF — visible pour tous */}
                      <button
                        onClick={() => handleDownloadPDF(obs.id_observation)}
                        disabled={downloading === obs.id_observation}
                        title="Télécharger en PDF"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === obs.id_observation
                          ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                          : <Download className="w-3.5 h-3.5" />
                        }
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* ── Résumé toujours visible ── */}
                  <div className="space-y-3">
                    {(obs.motif_consultation || obs.motif_hospitalisation) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Motif</p>
                        <p className="text-sm text-gray-900 font-medium">{obs.motif_consultation || obs.motif_hospitalisation}</p>
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

                  {/* ── Détails complets (accordion) ── */}
                  {isExpanded && (
                    <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">

                      {/* Antécédents */}
                      {(obs.antecedents_cmo || obs.antecedents_gmo || obs.antecedents_che) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Antécédents</h4>

                          {obs.antecedents_cmo && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">CMO</p>
                              {obs.antecedents_cmo.chirurgicaux     && <p className="text-xs text-gray-700 ml-2">• Chirurgicaux : {obs.antecedents_cmo.chirurgicaux}</p>}
                              {obs.antecedents_cmo.medicaux          && <p className="text-xs text-gray-700 ml-2">• Médicaux : {obs.antecedents_cmo.medicaux}</p>}
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
                              {obs.antecedents_che.curriculum_vitae         && <p className="text-xs text-gray-700 ml-2">• Curriculum Vitae : {obs.antecedents_che.curriculum_vitae}</p>}
                              {obs.antecedents_che.hospitalisation           && <p className="text-xs text-gray-700 ml-2">• Hospitalisation : {obs.antecedents_che.hospitalisation}</p>}
                              {obs.antecedents_che.niveau_socio_economique  && <p className="text-xs text-gray-700 ml-2">• Niveau socio-économique : {obs.antecedents_che.niveau_socio_economique}</p>}
                            </div>
                          )}
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
                              { label: 'TA',           value: obs.examen_general.tension_arterielle_gauche ? `${obs.examen_general.tension_arterielle_gauche} mmHg` : null },
                              { label: 'SpO2',         value: obs.examen_general.saturation_oxygene ? `${obs.examen_general.saturation_oxygene} %` : null },
                              { label: 'Poids',        value: obs.examen_general.poids ? `${obs.examen_general.poids} kg` : null },
                              { label: 'IMC',          value: obs.examen_general.imc },
                            ]
                              .filter(({ value }) => !!value)
                              .map(({ label, value }) => (
                                <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
                                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}

                      {/* Résumé syndromique */}
                      {obs.resume_syndromique && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Résumé syndromique</p>
                          <p className="text-sm text-gray-800 leading-relaxed">{obs.resume_syndromique}</p>
                        </div>
                      )}

                      {/* Hypothèses diagnostiques */}
                      {obs.hypotheses_diagnostiques && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Hypothèses diagnostiques</p>
                          <p className="text-sm text-gray-800 leading-relaxed">{obs.hypotheses_diagnostiques}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Diagnostic + CAT (toujours visibles si présents) ── */}
                  {(obs.diagnostic_retenu || obs.cat) && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      {obs.diagnostic_retenu && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Diagnostic retenu</p>
                          <p className="text-sm font-semibold text-green-900">{obs.diagnostic_retenu}</p>
                        </div>
                      )}
                      {obs.cat && (
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Conduite à tenir</p>
                          <p className="text-sm text-gray-800">{obs.cat}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Bouton accordion ── */}
                  <button
                    onClick={() => toggleExpand(obs.id_observation)}
                    className="mt-4 w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-gray-100"
                  >
                    {isExpanded
                      ? <><ChevronUp className="w-3.5 h-3.5" />Voir moins</>
                      : <><ChevronDown className="w-3.5 h-3.5" />Voir plus de détails</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}