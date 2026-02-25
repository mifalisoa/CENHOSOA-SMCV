import { useState } from 'react';
import { useSoinsMedicaux } from '../../../hooks/useSoinsMedicaux';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Heart, Calendar, Clock, User, CheckCircle, FileText } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Soins médicaux <span className="text-gray-500">({soins.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouveau soin</span>
          <span className="sm:hidden">Nouveau</span>
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <Heart className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucun soin médical enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md text-sm"
          >
            Créer le premier soin
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {soins.map((soin) => (
            <div
              key={soin.id_soin_medical}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-l-cyan-500"
            >
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Soin médical
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(soin.date_soin), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {soin.heure_soin}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-500" />
                    Réalisé par : <span className="text-gray-700">{soin.realise_par}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleVerify(soin.id_soin_medical)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm whitespace-nowrap ${
                    soin.verifie
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {soin.verifie ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
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
                      <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 uppercase mb-1">ETT (Échocardiographie Transthoracique)</p>
                        <p className="text-sm text-blue-800 whitespace-pre-line break-words">{soin.ett}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.eto && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-900 uppercase mb-1">ETO (Échocardiographie Transœsophagienne)</p>
                        <p className="text-sm text-purple-800 whitespace-pre-line break-words">{soin.eto}</p>
                      </div>
                    </div>
                  </div>
                )}

                {soin.autre && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 uppercase mb-1">Autre soin médical</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line break-words">{soin.autre}</p>
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