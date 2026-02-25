import { useState } from 'react';
import { useSoinsMedicaux } from '../../../hooks/useSoinsMedicaux';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddSoinMedicalModal from './AddSoinMedicalModal';

interface SoinsMedicauxTabProps {
  patient: Patient;
}

export default function SoinsMedicauxTab({ patient }: SoinsMedicauxTabProps) {
  const { soins, loading, error, createSoin, verifySoin } = useSoinsMedicaux(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateSoin = async (data: CreateSoinMedicalDTO) => {
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
          Soins médicaux ({soins.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau soin
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddSoinMedicalModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateSoin}
        />
      )}

      {/* Liste des soins */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun soin médical enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Créer le premier soin
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {soins.map((soin) => (
            <div
              key={soin.id_soin_medical}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-red-500"
            >
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                      ❤️ Soin médical
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {format(new Date(soin.date_soin), 'dd MMMM yyyy', { locale: fr })} à {soin.heure_soin}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Réalisé par : <span className="text-gray-700">{soin.realise_par}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleVerify(soin.id_soin_medical)}
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

              {/* Détails des soins */}
              <div className="space-y-3">
                {soin.ett && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-blue-900 uppercase mb-1">ETT (Échocardiographie Transthoracique)</p>
                        <p className="text-sm text-blue-800 whitespace-pre-line">{soin.ett}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.eto && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-purple-900 uppercase mb-1">ETO (Échocardiographie Transœsophagienne)</p>
                        <p className="text-sm text-purple-800 whitespace-pre-line">{soin.eto}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.autre && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-700 uppercase mb-1">Autre soin médical</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{soin.autre}</p>
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