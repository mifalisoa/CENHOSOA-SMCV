import { useSoinsInfirmiers } from '../../../hooks/useSoinsInfirmiers';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SoinsInfirmiersTabProps {
  patient: Patient;
}

export default function SoinsInfirmiersTab({ patient }: SoinsInfirmiersTabProps) {
  const { soins, loading, error, verifySoin } = useSoinsInfirmiers(patient.id_patient);

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
          Soins infirmiers ({soins.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nouveau soin
        </button>
      </div>

      {/* Liste des soins */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun soin infirmier enregistré</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {soins.map((soin) => (
            <div key={soin.id_soin_infirmier} className="bg-white border border-gray-200 rounded-lg p-5">
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">
                    {format(new Date(soin.date_soin), 'dd MMMM yyyy', { locale: fr })} à {soin.heure_soin}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    👨‍⚕️ {soin.realise_par}
                  </p>
                </div>
                <button
                  onClick={() => verifySoin(soin.id_soin_infirmier)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    soin.verifie
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {soin.verifie ? '✓ Vérifié' : '○ Non vérifié'}
                </button>
              </div>

              {/* Types de soins */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {soin.ecg && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">📊 ECG</p>
                    <p className="text-sm text-blue-900">{soin.ecg}</p>
                  </div>
                )}
                {soin.ecg_dii_long && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">📈 ECG + DII long</p>
                    <p className="text-sm text-blue-900">{soin.ecg_dii_long}</p>
                  </div>
                )}
                {soin.injection_iv && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-800 mb-1">💉 Injection IV</p>
                    <p className="text-sm text-purple-900">{soin.injection_iv}</p>
                  </div>
                )}
                {soin.injection_im && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-800 mb-1">💉 Injection IM</p>
                    <p className="text-sm text-purple-900">{soin.injection_im}</p>
                  </div>
                )}
                {soin.pse && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-indigo-800 mb-1">⚙️ PSE</p>
                    <p className="text-sm text-indigo-900">{soin.pse}</p>
                  </div>
                )}
                {soin.pansement && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-800 mb-1">🩹 Pansement</p>
                    <p className="text-sm text-green-900">{soin.pansement}</p>
                  </div>
                )}
                {soin.autre_soins && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-800 mb-1">🔧 Autres soins</p>
                    <p className="text-sm text-gray-900">{soin.autre_soins}</p>
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