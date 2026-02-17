import { useBilansBiologiques } from '../../../hooks/useBilansBiologiques';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BilansBiologiquesTabProps {
  patient: Patient;
}

export default function BilansBiologiquesTab({ patient }: BilansBiologiquesTabProps) {
  const { bilans, loading, error } = useBilansBiologiques(patient.id_patient);

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
          Bilans biologiques ({bilans.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nouveau bilan
        </button>
      </div>

      {/* Liste des bilans */}
      {bilans.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun bilan biologique enregistré</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bilans.map((bilan) => (
            <div key={bilan.id_bilan} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* En-tête du bilan */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {bilan.type_bilan || 'Bilan biologique'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Prélèvement : {format(new Date(bilan.date_prelevement), 'dd MMM yyyy', { locale: fr })} à {bilan.heure_prelevement}
                  </p>
                </div>
                {bilan.prescripteur && (
                  <span className="text-sm text-gray-600">
                    Dr. {bilan.prescripteur}
                  </span>
                )}
              </div>

              {/* Résultats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {bilan.creatinine && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Créatinine</p>
                    <p className="text-lg font-semibold text-gray-900">{bilan.creatinine} <span className="text-xs font-normal">mg/L</span></p>
                  </div>
                )}
                {bilan.glycemie && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Glycémie</p>
                    <p className="text-lg font-semibold text-gray-900">{bilan.glycemie} <span className="text-xs font-normal">g/L</span></p>
                  </div>
                )}
                {bilan.crp && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">CRP</p>
                    <p className="text-lg font-semibold text-gray-900">{bilan.crp} <span className="text-xs font-normal">mg/L</span></p>
                  </div>
                )}
                {bilan.inr && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">INR</p>
                    <p className="text-lg font-semibold text-gray-900">{bilan.inr}</p>
                  </div>
                )}
                {bilan.nfs && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">NFS</p>
                    <p className="text-lg font-semibold text-gray-900">{bilan.nfs} <span className="text-xs font-normal">×10³/mm³</span></p>
                  </div>
                )}
              </div>

              {/* Interprétation */}
              {bilan.interpretation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 uppercase mb-1">Interprétation</p>
                  <p className="text-sm text-blue-900">{bilan.interpretation}</p>
                </div>
              )}

              {/* Laboratoire */}
              {bilan.laboratoire && (
                <p className="mt-3 text-xs text-gray-500">
                  📍 {bilan.laboratoire}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}