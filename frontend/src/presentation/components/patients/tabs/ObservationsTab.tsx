import { useState } from 'react';
import { useObservations } from '../../../hooks/useObservations';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, Stethoscope, Calendar, Clock, User } from 'lucide-react';
import AddObservationModal from './AddObservationModal';

interface ObservationsTabProps {
  patient: Patient;
}

export default function ObservationsTab({ patient }: ObservationsTabProps) {
  const { observations, loading, error, createObservation } = useObservations(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateObservation = async (data: CreateObservationDTO) => {
    await createObservation(data);
    setShowAddModal(false);
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
      {/* Header avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Observations médicales <span className="text-gray-500">({observations.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouvelle observation</span>
          <span className="sm:hidden">Nouvelle obs.</span>
        </button>
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
          {observations.map((obs) => (
            <div
              key={obs.id_observation}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-l-blue-500"
            >
              {/* En-tête de l'observation */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
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
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1 sm:justify-end">
                    <User className="w-4 h-4 text-gray-500" />
                    Dr. {obs.medecin}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-semibold">Médecin Traitant</p>
                </div>
              </div>

              {/* Contenu de l'observation */}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}