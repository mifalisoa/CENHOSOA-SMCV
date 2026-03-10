import { useState } from 'react';
import { useTraitements } from '../../../hooks/useTraitements';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateTraitementDTO } from '../../../../core/entities/Traitement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Pill, Calendar, Clock, User, FileText, Download, FileArchive } from 'lucide-react';
import AddTraitementModal from './AddTraitementModal';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface TraitementsTabProps {
  patient: Patient;
}

export default function TraitementsTab({ patient }: TraitementsTabProps) {
  const { traitements, loading, error, createTraitement } = useTraitements(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleCreateTraitement = async (data: CreateTraitementDTO) => {
    await createTraitement(data);
    setShowAddModal(false);
  };

  // Télécharger un traitement en PDF
  const handleDownloadPDF = async (traitementId: number) => {
    setDownloading(traitementId);
    try {
      const response = await httpClient.get(`/traitements/${traitementId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traitement_${traitementId}_${patient.nom_patient}.pdf`);
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

  // Télécharger tous les traitements en ZIP
  const handleDownloadAllZIP = async () => {
    if (traitements.length === 0) {
      toast.error('Aucun traitement à télécharger');
      return;
    }

    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/traitements/patient/${patient.id_patient}/zip`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traitements_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${traitements.length} traitement(s) téléchargé(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading && traitements.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && traitements.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Traitements <span className="text-gray-500">({traitements.length})</span>
        </h3>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Bouton ZIP */}
          {traitements.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingAll ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nouveau traitement</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddTraitementModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTraitement}
        />
      )}

      {/* Liste des traitements */}
      {traitements.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <Pill className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucun traitement enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md text-sm"
          >
            Créer le premier traitement
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {traitements.map((traitement) => (
            <div
              key={traitement.id_traitement}
              className={`bg-white border rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all border-l-4 ${
                traitement.type_document === 'ordonnance' 
                  ? 'border-l-blue-500' 
                  : 'border-l-indigo-500'
              }`}
            >
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      traitement.type_document === 'ordonnance'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      <FileText className="w-3 h-3" />
                      {traitement.type_document}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(traitement.date_prescription), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {traitement.heure_prescription}
                    </span>
                  </div>
                  {traitement.prescripteur && (
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-500" />
                      Prescrit par : <span className="text-gray-700">{traitement.prescripteur}</span>
                    </p>
                  )}
                </div>

                {/* Bouton PDF */}
                <button
                  onClick={() => handleDownloadPDF(traitement.id_traitement)}
                  disabled={downloading === traitement.id_traitement}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {downloading === traitement.id_traitement ? (
                    <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>

              {/* Détails du traitement */}
              <div className="space-y-3">
                {traitement.diagnostic && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-amber-900 uppercase mb-1">Diagnostic</p>
                    <p className="text-sm text-amber-800">{traitement.diagnostic}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Pill className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs font-bold text-blue-900 uppercase">Médicament</p>
                        <p className="text-sm font-semibold text-blue-800">{traitement.medicament} - {traitement.dosage}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium text-blue-700">Voie</p>
                          <p className="text-blue-900">{traitement.voie_administration}</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Fréquence</p>
                          <p className="text-blue-900">{traitement.frequence}</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Durée</p>
                          <p className="text-blue-900">{traitement.duree}</p>
                        </div>
                        {traitement.lieu_prescription && (
                          <div>
                            <p className="font-medium text-blue-700">Lieu</p>
                            <p className="text-blue-900">{traitement.lieu_prescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {traitement.instructions && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-green-900 uppercase mb-1">Instructions</p>
                    <p className="text-sm text-green-800 whitespace-pre-line">{traitement.instructions}</p>
                  </div>
                )}

                {traitement.observations_speciales && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-orange-900 uppercase mb-1">Observations spéciales</p>
                    <p className="text-sm text-orange-800 whitespace-pre-line">{traitement.observations_speciales}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}