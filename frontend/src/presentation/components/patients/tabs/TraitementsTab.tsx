import { useTraitements } from '../../../hooks/useTraitements';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TraitementsTabProps {
  patient: Patient;
}

export default function TraitementsTab({ patient }: TraitementsTabProps) {
  const { traitements, loading, error } = useTraitements(patient.id_patient);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Traitements & Ordonnances ({traitements.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nouveau traitement
        </button>
      </div>

      {/* Liste des traitements */}
      {traitements.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun traitement enregistré</p>
        </div>
      ) : (
        <div className="space-y-4">
          {traitements.map((traitement) => (
            <div key={traitement.id_traitement} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      traitement.type_document === 'ordonnance'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {traitement.type_document === 'ordonnance' ? '📋 Ordonnance' : '💊 Traitement'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(traitement.date_prescription), 'dd MMMM yyyy', { locale: fr })} à {traitement.heure_prescription}
                  </p>
                  {traitement.prescripteur && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Dr. {traitement.prescripteur}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagnostic */}
              {traitement.diagnostic && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 uppercase mb-1">Diagnostic</p>
                  <p className="text-sm text-amber-900">{traitement.diagnostic}</p>
                </div>
              )}

              {/* Médicament principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-lg font-bold text-blue-900 mb-2">
                  💊 {traitement.medicament}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Dosage</p>
                    <p className="text-blue-900 font-semibold">{traitement.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Voie</p>
                    <p className="text-blue-900">{traitement.voie_administration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Fréquence</p>
                    <p className="text-blue-900">{traitement.frequence}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Durée</p>
                    <p className="text-blue-900 font-semibold">{traitement.duree}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {traitement.instructions && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 uppercase mb-1">Instructions</p>
                  <p className="text-sm text-gray-900">{traitement.instructions}</p>
                </div>
              )}

              {/* Observations spéciales */}
              {traitement.observations_speciales && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-800 uppercase mb-1">⚠️ Observations spéciales</p>
                  <p className="text-sm text-red-900">{traitement.observations_speciales}</p>
                </div>
              )}

              {/* Lieu de prescription */}
              {traitement.lieu_prescription && (
                <p className="mt-3 text-xs text-gray-500">
                  📍 Prescrit à : {traitement.lieu_prescription}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}