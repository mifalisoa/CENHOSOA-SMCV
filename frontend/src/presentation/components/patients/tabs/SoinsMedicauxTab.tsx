import { useSoinsMedicaux } from '../../../hooks/useSoinsMedicaux';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SoinsMedicauxTabProps {
  patient: Patient;
}

export default function SoinsMedicauxTab({ patient }: SoinsMedicauxTabProps) {
  const { soins, loading, error, verifySoin } = useSoinsMedicaux(patient.id_patient);

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
          Soins médicaux ({soins.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nouveau soin
        </button>
      </div>

      {/* Liste des soins */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun soin médical enregistré</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {soins.map((soin) => (
            <div key={soin.id_soin_medical} className="bg-white border border-gray-200 rounded-lg p-5">
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">
                    {format(new Date(soin.date_soin), 'dd MMMM yyyy', { locale: fr })} à {soin.heure_soin}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Réalisé par : {soin.realise_par}
                  </p>
                </div>
                <button
                  onClick={() => verifySoin(soin.id_soin_medical)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    soin.verifie
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {soin.verifie ? '✓ Vérifié' : '○ Non vérifié'}
                </button>
              </div>

              {/* Détails des soins */}
              <div className="space-y-2">
                {soin.ett && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-blue-600">ETT:</span>
                    <span className="text-sm text-gray-700">{soin.ett}</span>
                  </div>
                )}
                {soin.eto && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-purple-600">ETO:</span>
                    <span className="text-sm text-gray-700">{soin.eto}</span>
                  </div>
                )}
                {soin.autre && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-600">Autre:</span>
                    <span className="text-sm text-gray-700">{soin.autre}</span>
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