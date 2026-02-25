import { useState } from 'react';
import { useBilansBiologiques } from '../../../hooks/useBilansBiologiques';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateBilanBiologiqueDTO } from '../../../../core/entities/BilanBiologique';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddBilanBiologiqueModal from './AddBilanBiologiqueModal';

interface BilansBiologiquesTabProps {
  patient: Patient;
}

export default function BilansBiologiquesTab({ patient }: BilansBiologiquesTabProps) {
  const { bilans, loading, error, createBilan } = useBilansBiologiques(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateBilan = async (data: CreateBilanBiologiqueDTO) => {
    await createBilan(data);
    setShowAddModal(false);
  };

  if (loading && bilans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && bilans.length === 0) {
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
          Bilans biologiques ({bilans.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau bilan
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddBilanBiologiqueModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateBilan}
        />
      )}

      {/* Liste des bilans */}
      {bilans.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun bilan biologique enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Créer le premier bilan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bilans.map((bilan) => (
            <div
              key={bilan.id_bilan}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-purple-500"
            >
              {/* En-tête du bilan */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                      🧪 {bilan.type_bilan || 'Bilan biologique'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Prélèvement : {format(new Date(bilan.date_prelevement), 'dd MMMM yyyy', { locale: fr })} à {bilan.heure_prelevement}
                  </p>
                </div>
                {bilan.prescripteur && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">Dr. {bilan.prescripteur}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-semibold">Prescripteur</p>
                  </div>
                )}
              </div>

              {/* Résultats principaux */}
              {(bilan.creatinine || bilan.glycemie || bilan.crp || bilan.inr || bilan.nfs) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {bilan.creatinine && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Créatinine</p>
                      <p className="text-lg font-bold text-blue-900">
                        {bilan.creatinine}
                        <span className="text-xs font-normal ml-1">mg/L</span>
                      </p>
                      <p className="text-[10px] text-blue-600 mt-0.5">Norme: 7-13</p>
                    </div>
                  )}
                  {bilan.glycemie && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-700 font-semibold mb-1">Glycémie</p>
                      <p className="text-lg font-bold text-green-900">
                        {bilan.glycemie}
                        <span className="text-xs font-normal ml-1">g/L</span>
                      </p>
                      <p className="text-[10px] text-green-600 mt-0.5">Norme: 0.7-1.1</p>
                    </div>
                  )}
                  {bilan.crp && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                      <p className="text-xs text-red-700 font-semibold mb-1">CRP</p>
                      <p className="text-lg font-bold text-red-900">
                        {bilan.crp}
                        <span className="text-xs font-normal ml-1">mg/L</span>
                      </p>
                      <p className="text-[10px] text-red-600 mt-0.5">Norme: &lt;5</p>
                    </div>
                  )}
                  {bilan.inr && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold mb-1">INR</p>
                      <p className="text-lg font-bold text-purple-900">{bilan.inr}</p>
                      <p className="text-[10px] text-purple-600 mt-0.5">Norme: 0.8-1.2</p>
                    </div>
                  )}
                  {bilan.nfs && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-semibold mb-1">NFS</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {bilan.nfs}
                        <span className="text-xs font-normal ml-1">×10³</span>
                      </p>
                      <p className="text-[10px] text-yellow-600 mt-0.5">Norme: 4-10</p>
                    </div>
                  )}
                </div>
              )}

              {/* Résultats détaillés */}
              {bilan.resultat && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-1">Résultats détaillés</p>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{bilan.resultat}</p>
                </div>
              )}

              {/* Interprétation */}
              {bilan.interpretation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">Interprétation</p>
                  <p className="text-sm text-blue-900">{bilan.interpretation}</p>
                </div>
              )}

              {/* Laboratoire */}
              {bilan.laboratoire && (
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {bilan.laboratoire}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}