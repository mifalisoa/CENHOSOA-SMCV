import { useState } from 'react';
import { useObservations } from '../../../hooks/useObservations';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Observations médicales ({observations.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle observation
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium">Aucune observation enregistrée pour ce patient.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Créer la première observation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map((obs) => (
            <div
              key={obs.id_observation}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-blue-500"
            >
              {/* En-tête de l'observation */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      obs.type_observation === 'externe' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {obs.type_observation === 'externe' ? '🏥 Consultation' : '🛏️ Hospitalisation'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(obs.date_observation), 'dd MMMM yyyy', { locale: fr })} à {obs.heure_observation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Dr. {obs.medecin}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-semibold">Médecin Traitant</p>
                </div>
              </div>

              {/* Contenu de l'observation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(obs.motif_consultation || obs.motif_hospitalisation) && (
                  <div className="col-span-full mb-2">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Motif</h5>
                    <p className="text-sm text-gray-900 font-medium">{obs.motif_consultation || obs.motif_hospitalisation}</p>
                  </div>
                )}

                {obs.histoire_maladie && (
                  <div className="col-span-full">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Histoire de la maladie</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic border-l-2 border-gray-100 pl-4">
                      {obs.histoire_maladie}
                    </p>
                  </div>
                )}
              </div>

              {/* Diagnostic et CAT */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {obs.diagnostic_retenu && (
                  <div className="flex-1 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Diagnostic</p>
                    <p className="text-sm font-semibold text-green-900">{obs.diagnostic_retenu}</p>
                  </div>
                )}
                {obs.cat && (
                  <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Conduite à tenir</p>
                    <p className="text-sm text-blue-900">{obs.cat}</p>
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