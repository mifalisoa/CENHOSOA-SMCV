import { useState } from 'react';
import { useObservations } from '../../../hooks/useObservations';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, Stethoscope, Calendar, Clock, User, Download, FileArchive } from 'lucide-react';
import AddObservationModal from './AddObservationModal';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface ObservationsTabProps {
  patient: Patient;
}

export default function ObservationsTab({ patient }: ObservationsTabProps) {
  const { observations, loading, error, createObservation } = useObservations(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [expandedObs, setExpandedObs] = useState<number | null>(null);

  const handleCreateObservation = async (data: CreateObservationDTO) => {
    await createObservation(data);
    setShowAddModal(false);
  };

  const toggleExpand = (obsId: number) => {
    setExpandedObs(expandedObs === obsId ? null : obsId);
  };

  // Télécharger une seule observation en PDF
  const handleDownloadPDF = async (observationId: number) => {
    setDownloading(observationId);
    try {
      const response = await httpClient.get(`/observations/${observationId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `observation_${observationId}_${patient.nom_patient}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF téléchargé avec succès !');
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(null);
    }
  };

  // Télécharger toutes les observations en ZIP
  const handleDownloadAllZIP = async () => {
    if (observations.length === 0) {
      toast.error('Aucune observation à télécharger');
      return;
    }

    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/observations/patient/${patient.id_patient}/zip`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `observations_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${observations.length} observation(s) téléchargée(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Gestion du chargement
  if (loading && observations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error && observations.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec boutons d'ajout et export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Observations médicales <span className="text-gray-500">({observations.length})</span>
        </h3>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Bouton Tout télécharger (ZIP) */}
          {observations.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Téléchargement...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span className="hidden sm:inline">Tout télécharger (ZIP)</span>
                  <span className="sm:hidden">ZIP</span>
                </>
              )}
            </button>
          )}

          {/* Bouton Nouvelle observation */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nouvelle observation</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddObservationModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateObservation}
        />
      )}

      {/* Liste des observations */}
      {observations.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucune observation enregistrée pour ce patient.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md text-sm"
          >
            Créer la première observation
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {observations.map((obs) => {
            const isExpanded = expandedObs === obs.id_observation;
            
            return (
              <div
                key={obs.id_observation}
                className="bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-md transition-all border-l-4 border-l-blue-500"
              >
                {/* En-tête de l'observation */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                          obs.type_observation === 'externe' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          <Stethoscope className="w-3 h-3" />
                          {obs.type_observation === 'externe' ? 'Consultation' : 'Hospitalisation'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(obs.date_observation), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {obs.heure_observation}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Bouton Download PDF */}
                      <button
                        onClick={() => handleDownloadPDF(obs.id_observation)}
                        disabled={downloading === obs.id_observation}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Télécharger en PDF"
                      >
                        {downloading === obs.id_observation ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {/* Médecin */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1 sm:justify-end">
                          <User className="w-4 h-4 text-gray-500" />
                          {obs.medecin}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-semibold">Médecin</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu résumé (toujours visible) */}
                  <div className="space-y-3 sm:space-y-4">
                    {(obs.motif_consultation || obs.motif_hospitalisation) && (
                      <div>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Motif</h5>
                        <p className="text-sm text-gray-900 font-medium">{obs.motif_consultation || obs.motif_hospitalisation}</p>
                      </div>
                    )}

                    {obs.histoire_maladie && (
                      <div>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Histoire de la maladie</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic border-l-2 border-gray-200 pl-3 sm:pl-4">
                          {obs.histoire_maladie}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Détails complets (expandable) */}
                  {isExpanded && (
                    <div className="mt-6 space-y-4 border-t pt-4">
                      {/* Antécédents */}
                      {(obs.antecedents_cmo || obs.antecedents_gmo || obs.antecedents_che) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-bold text-gray-700 mb-3">ANTÉCÉDENTS</h4>
                          
                          {obs.antecedents_cmo && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600">CMO</p>
                              {obs.antecedents_cmo.chirurgicaux && <p className="text-xs text-gray-700">• Chirurgicaux : {obs.antecedents_cmo.chirurgicaux}</p>}
                              {obs.antecedents_cmo.medicaux && <p className="text-xs text-gray-700">• Médicaux : {obs.antecedents_cmo.medicaux}</p>}
                              {obs.antecedents_cmo.gyneco_obstetricaux && <p className="text-xs text-gray-700">• Gynéco-obstétricaux : {obs.antecedents_cmo.gyneco_obstetricaux}</p>}
                            </div>
                          )}
                          
                          {obs.antecedents_gmo && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600">GMO</p>
                              {obs.antecedents_gmo.genetique && <p className="text-xs text-gray-700">• Génétique : {obs.antecedents_gmo.genetique}</p>}
                              {obs.antecedents_gmo.mode_vie && <p className="text-xs text-gray-700">• Mode de vie : {obs.antecedents_gmo.mode_vie}</p>}
                            </div>
                          )}
                          
                          {obs.antecedents_che && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600">CHE</p>
                              {obs.antecedents_che.curriculum_vitae && <p className="text-xs text-gray-700">• Curriculum Vitae : {obs.antecedents_che.curriculum_vitae}</p>}
                              {obs.antecedents_che.hospitalisation && <p className="text-xs text-gray-700">• Hospitalisation : {obs.antecedents_che.hospitalisation}</p>}
                              {obs.antecedents_che.niveau_socio_economique && <p className="text-xs text-gray-700">• Niveau socio-économique : {obs.antecedents_che.niveau_socio_economique}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Examen clinique */}
                      {obs.examen_general && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-bold text-blue-800 mb-2">EXAMEN GÉNÉRAL</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {obs.examen_general.etat_general && <p><span className="font-semibold">État général:</span> {obs.examen_general.etat_general}</p>}
                            {obs.examen_general.temperature && <p><span className="font-semibold">T°:</span> {obs.examen_general.temperature}°C</p>}
                            {obs.examen_general.frequence_cardiaque && <p><span className="font-semibold">FC:</span> {obs.examen_general.frequence_cardiaque} bpm</p>}
                            {obs.examen_general.tension_arterielle_gauche && <p><span className="font-semibold">TA:</span> {obs.examen_general.tension_arterielle_gauche} mmHg</p>}
                            {obs.examen_general.saturation_oxygene && <p><span className="font-semibold">SpO2:</span> {obs.examen_general.saturation_oxygene}%</p>}
                            {obs.examen_general.poids && <p><span className="font-semibold">Poids:</span> {obs.examen_general.poids} kg</p>}
                            {obs.examen_general.imc && <p><span className="font-semibold">IMC:</span> {obs.examen_general.imc}</p>}
                          </div>
                        </div>
                      )}

                      {/* Résumé syndromique */}
                      {obs.resume_syndromique && (
                        <div>
                          <h5 className="text-xs font-bold text-gray-600 uppercase mb-1">Résumé syndromique</h5>
                          <p className="text-sm text-gray-700">{obs.resume_syndromique}</p>
                        </div>
                      )}

                      {/* Hypothèses diagnostiques */}
                      {obs.hypotheses_diagnostiques && (
                        <div>
                          <h5 className="text-xs font-bold text-gray-600 uppercase mb-1">Hypothèses diagnostiques</h5>
                          <p className="text-sm text-gray-700">{obs.hypotheses_diagnostiques}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Diagnostic et CAT */}
                  {(obs.diagnostic_retenu || obs.cat) && (
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                      {obs.diagnostic_retenu && (
                        <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Diagnostic</p>
                          <p className="text-sm font-semibold text-green-900">{obs.diagnostic_retenu}</p>
                        </div>
                      )}
                      {obs.cat && (
                        <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Conduite à tenir</p>
                          <p className="text-sm text-blue-900">{obs.cat}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bouton Voir plus/moins */}
                  <button
                    onClick={() => toggleExpand(obs.id_observation)}
                    className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Voir moins
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Voir plus de détails
                      </>
                    )}
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