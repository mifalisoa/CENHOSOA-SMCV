import { useState } from 'react';
import { useBilansBiologiques } from '../../../hooks/useBilansBiologiques';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateBilanBiologiqueDTO } from '../../../../core/entities/BilanBiologique';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Beaker, Calendar, Clock, User, Building2 } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Bilans biologiques <span className="text-gray-500">({bilans.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouveau bilan</span>
          <span className="sm:hidden">Nouveau</span>
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <Beaker className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucun bilan biologique enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md text-sm"
          >
            Créer le premier bilan
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {bilans.map((bilan) => (
            <div
              key={bilan.id_bilan}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-l-cyan-500"
            >
              {/* En-tête du bilan */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 flex items-center gap-1">
                      <Beaker className="w-3 h-3" />
                      {bilan.type_bilan || 'Bilan biologique'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(bilan.date_prelevement), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bilan.heure_prelevement}
                    </span>
                  </div>
                </div>
                {bilan.prescripteur && (
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1 sm:justify-end">
                      <User className="w-4 h-4 text-gray-500" />
                      Dr. {bilan.prescripteur}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-semibold">Prescripteur</p>
                  </div>
                )}
              </div>

              {/* Résultats principaux */}
              {(bilan.creatinine || bilan.glycemie || bilan.crp || bilan.inr || bilan.nfs) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4">
                  {bilan.creatinine && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200">
                      <p className="text-[10px] sm:text-xs text-blue-700 font-semibold mb-1">Créatinine</p>
                      <p className="text-base sm:text-lg font-bold text-blue-900">
                        {bilan.creatinine}
                        <span className="text-[10px] sm:text-xs font-normal ml-1">mg/L</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-blue-600 mt-0.5">Norme: 7-13</p>
                    </div>
                  )}
                  {bilan.glycemie && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3 border border-green-200">
                      <p className="text-[10px] sm:text-xs text-green-700 font-semibold mb-1">Glycémie</p>
                      <p className="text-base sm:text-lg font-bold text-green-900">
                        {bilan.glycemie}
                        <span className="text-[10px] sm:text-xs font-normal ml-1">g/L</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-green-600 mt-0.5">Norme: 0.7-1.1</p>
                    </div>
                  )}
                  {bilan.crp && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2 sm:p-3 border border-red-200">
                      <p className="text-[10px] sm:text-xs text-red-700 font-semibold mb-1">CRP</p>
                      <p className="text-base sm:text-lg font-bold text-red-900">
                        {bilan.crp}
                        <span className="text-[10px] sm:text-xs font-normal ml-1">mg/L</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-red-600 mt-0.5">Norme: &lt;5</p>
                    </div>
                  )}
                  {bilan.inr && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3 border border-purple-200">
                      <p className="text-[10px] sm:text-xs text-purple-700 font-semibold mb-1">INR</p>
                      <p className="text-base sm:text-lg font-bold text-purple-900">{bilan.inr}</p>
                      <p className="text-[9px] sm:text-[10px] text-purple-600 mt-0.5">Norme: 0.8-1.2</p>
                    </div>
                  )}
                  {bilan.nfs && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 sm:p-3 border border-yellow-200">
                      <p className="text-[10px] sm:text-xs text-yellow-700 font-semibold mb-1">NFS</p>
                      <p className="text-base sm:text-lg font-bold text-yellow-900">
                        {bilan.nfs}
                        <span className="text-[10px] sm:text-xs font-normal ml-1">×10³</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-yellow-600 mt-0.5">Norme: 4-10</p>
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
                  <Building2 className="w-4 h-4" />
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