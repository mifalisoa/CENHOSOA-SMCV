import { useState } from 'react';
import { useSoinsInfirmiers } from '../../../hooks/useSoinsInfirmiers';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateSoinInfirmierDTO } from '../../../../core/entities/SoinInfirmier';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddSoinInfirmierModal from './AddSoinInfirmierModal';

interface SoinsInfirmiersTabProps {
  patient: Patient;
}

export default function SoinsInfirmiersTab({ patient }: SoinsInfirmiersTabProps) {
  const { soins, loading, error, createSoin, verifySoin } = useSoinsInfirmiers(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateSoin = async (data: CreateSoinInfirmierDTO) => {
    await createSoin(data);
    setShowAddModal(false);
  };

  const handleVerify = async (id: number) => {
    await verifySoin(id);
  };

  if (loading && soins.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && soins.length === 0) {
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
          Soins infirmiers ({soins.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau soin
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddSoinInfirmierModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateSoin}
        />
      )}

      {/* Liste des soins */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun soin infirmier enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            Créer le premier soin
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {soins.map((soin) => (
            <div
              key={soin.id_soin_infirmier}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-teal-500"
            >
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                      💉 Soin infirmier
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {format(new Date(soin.date_soin), 'dd MMMM yyyy', { locale: fr })} à {soin.heure_soin}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    👨‍⚕️ {soin.realise_par}
                  </p>
                </div>
                <button
                  onClick={() => handleVerify(soin.id_soin_infirmier)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                    soin.verifie
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {soin.verifie ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Vérifié
                    </span>
                  ) : (
                    'Marquer vérifié'
                  )}
                </button>
              </div>

              {/* Types de soins */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {soin.ecg && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📊</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">ECG</p>
                        <p className="text-sm text-blue-900 break-words">{soin.ecg}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.ecg_dii_long && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📈</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">ECG + DII long</p>
                        <p className="text-sm text-blue-900 break-words">{soin.ecg_dii_long}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.injection_iv && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💉</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-800 uppercase mb-1">Injection IV</p>
                        <p className="text-sm text-purple-900 break-words whitespace-pre-line">{soin.injection_iv}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.injection_im && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💉</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-800 uppercase mb-1">Injection IM</p>
                        <p className="text-sm text-purple-900 break-words whitespace-pre-line">{soin.injection_im}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.pse && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚙️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-indigo-800 uppercase mb-1">PSE</p>
                        <p className="text-sm text-indigo-900 break-words whitespace-pre-line">{soin.pse}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.pansement && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🩹</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-green-800 uppercase mb-1">Pansement</p>
                        <p className="text-sm text-green-900 break-words whitespace-pre-line">{soin.pansement}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.autre_soins && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:col-span-2 lg:col-span-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🔧</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 uppercase mb-1">Autres soins</p>
                        <p className="text-sm text-gray-800 break-words whitespace-pre-line">{soin.autre_soins}</p>
                      </div>
                    </div>
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