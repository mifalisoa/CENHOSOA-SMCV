import { useState } from 'react';
import { useTraitements } from '../../../hooks/useTraitements';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateTraitementDTO } from '../../../../core/entities/Traitement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Pill, Calendar, Clock, User, MapPin, FileText, AlertTriangle, Info } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Traitements & Ordonnances <span className="text-gray-500">({traitements.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouvelle prescription</span>
          <span className="sm:hidden">Nouvelle</span>
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <Pill className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucun traitement enregistré</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md text-sm"
          >
            Créer la première prescription
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {traitements.map((traitement) => (
            <div
              key={traitement.id_traitement}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-l-cyan-500"
            >
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      traitement.type_document === 'ordonnance'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <FileText className="w-3 h-3" />
                      {traitement.type_document === 'ordonnance' ? 'Ordonnance' : 'Traitement'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(traitement.date_prescription), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {traitement.heure_prescription}
                    </span>
                  </div>
                  {traitement.prescripteur && (
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-500" />
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
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-base sm:text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Pill className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="truncate">{traitement.medicament}</span>
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-1">Dosage</p>
                    <p className="text-blue-900 font-bold truncate">{traitement.dosage}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-1">Voie</p>
                    <p className="text-blue-900 truncate">{traitement.voie_administration}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-1">Fréquence</p>
                    <p className="text-blue-900 truncate">{traitement.frequence}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-1">Durée</p>
                    <p className="text-blue-900 font-bold truncate">{traitement.duree}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {traitement.instructions && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 uppercase mb-1">Instructions</p>
                      <p className="text-sm text-gray-900 whitespace-pre-line break-words">{traitement.instructions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations spéciales */}
              {traitement.observations_speciales && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-red-800 uppercase mb-1">⚠️ Observations spéciales</p>
                      <p className="text-sm text-red-900 whitespace-pre-line break-words">{traitement.observations_speciales}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lieu de prescription */}
              {traitement.lieu_prescription && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Prescrit à : {traitement.lieu_prescription}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}