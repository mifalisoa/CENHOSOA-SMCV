import { useState } from 'react';
import { useTraitements } from '../../../hooks/useTraitements';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateTraitementDTO } from '../../../../core/entities/Traitement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddTraitementModal from './AddTraitementModal';

interface TraitementsTabProps {
  patient: Patient;
}

export default function TraitementsTab({ patient }: TraitementsTabProps) {
  const { traitements, loading, error, createTraitement } = useTraitements(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateTraitement = async (data: CreateTraitementDTO) => {
    await createTraitement(data);
    setShowAddModal(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Traitements & Ordonnances ({traitements.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle prescription
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddTraitementModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTraitement}
        />
      )}

      {/* Liste des traitements */}
      {traitements.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun traitement enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Créer la première prescription
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {traitements.map((traitement) => (
            <div
              key={traitement.id_traitement}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-indigo-500"
            >
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      traitement.type_document === 'ordonnance'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {traitement.type_document === 'ordonnance' ? '📋 Ordonnance' : '💊 Traitement'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {format(new Date(traitement.date_prescription), 'dd MMMM yyyy', { locale: fr })} à {traitement.heure_prescription}
                  </p>
                  {traitement.prescripteur && (
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {traitement.prescripteur}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagnostic */}
              {traitement.diagnostic && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">Diagnostic</p>
                  <p className="text-sm text-amber-900">{traitement.diagnostic}</p>
                </div>
              )}

              {/* Médicament principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💊</span>
                  {traitement.medicament}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Dosage</p>
                    <p className="text-blue-900 font-bold">{traitement.dosage}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Voie</p>
                    <p className="text-blue-900">{traitement.voie_administration}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Fréquence</p>
                    <p className="text-blue-900">{traitement.frequence}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Durée</p>
                    <p className="text-blue-900 font-bold">{traitement.duree}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {traitement.instructions && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700 uppercase mb-1">Instructions</p>
                      <p className="text-sm text-gray-900 whitespace-pre-line">{traitement.instructions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations spéciales */}
              {traitement.observations_speciales && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-red-800 uppercase mb-1">⚠️ Observations spéciales</p>
                      <p className="text-sm text-red-900 whitespace-pre-line">{traitement.observations_speciales}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lieu de prescription */}
              {traitement.lieu_prescription && (
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Prescrit à : {traitement.lieu_prescription}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}