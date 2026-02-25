import { useState } from 'react';
import { X, Calendar, Clock, Heart, User, FileText, CheckCircle } from 'lucide-react';
import type { CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import type { Patient } from '../../../../core/entities/Patient';

interface AddSoinMedicalModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateSoinMedicalDTO) => Promise<void>;
}

export default function AddSoinMedicalModal({ patient, onClose, onSubmit }: AddSoinMedicalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateSoinMedicalDTO>>({
    id_patient: patient.id_patient,
    date_soin: new Date().toISOString().split('T')[0],
    heure_soin: new Date().toTimeString().slice(0, 5),
    verifie: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ett && !formData.eto && !formData.autre) {
      setError('Veuillez renseigner au moins un type de soin (ETT, ETO ou Autre)');
      return;
    }

    if (!formData.realise_par) {
      setError('Veuillez indiquer qui a réalisé le soin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateSoinMedicalDTO);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="truncate">Nouveau soin médical</span>
              </h2>
              <p className="text-cyan-100 text-xs sm:text-sm truncate">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-red-800 text-xs sm:text-sm">❌ {error}</p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Informations générales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Date et heure du soin
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="date-soin" className="block text-sm font-medium text-gray-700 mb-2">
                    Date du soin *
                  </label>
                  <input
                    id="date-soin"
                    type="date"
                    required
                    value={formData.date_soin || ''}
                    onChange={(e) => setFormData({ ...formData, date_soin: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="heure-soin" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Heure *
                  </label>
                  <input
                    id="heure-soin"
                    type="time"
                    required
                    value={formData.heure_soin || ''}
                    onChange={(e) => setFormData({ ...formData, heure_soin: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Types de soins */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-cyan-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Types de soins
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="ett" className="block text-sm font-medium text-gray-700 mb-2">
                    ETT (Échocardiographie Transthoracique)
                  </label>
                  <textarea
                    id="ett"
                    rows={3}
                    value={formData.ett || ''}
                    onChange={(e) => setFormData({ ...formData, ett: e.target.value })}
                    placeholder="Description de l'ETT réalisée..."
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple : Fraction d'éjection VG 55%, fonction VG normale
                  </p>
                </div>

                <div>
                  <label htmlFor="eto" className="block text-sm font-medium text-gray-700 mb-2">
                    ETO (Échocardiographie Transœsophagienne)
                  </label>
                  <textarea
                    id="eto"
                    rows={3}
                    value={formData.eto || ''}
                    onChange={(e) => setFormData({ ...formData, eto: e.target.value })}
                    placeholder="Description de l'ETO réalisée..."
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple : Absence de thrombus intra-auriculaire
                  </p>
                </div>

                <div>
                  <label htmlFor="autre" className="block text-sm font-medium text-gray-700 mb-2">
                    Autre soin médical
                  </label>
                  <textarea
                    id="autre"
                    rows={4}
                    value={formData.autre || ''}
                    onChange={(e) => setFormData({ ...formData, autre: e.target.value })}
                    placeholder="Description d'autres soins médicaux réalisés..."
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple : Pose de cathéter central, ponction d'ascite, drainage pleural
                  </p>
                </div>
              </div>
            </div>

            {/* Réalisé par et vérification */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Réalisation et vérification
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="realise-par" className="block text-sm font-medium text-gray-700 mb-2">
                    Réalisé par *
                  </label>
                  <input
                    id="realise-par"
                    type="text"
                    required
                    value={formData.realise_par || ''}
                    onChange={(e) => setFormData({ ...formData, realise_par: e.target.value })}
                    placeholder="Dr. Nom Prénom ou Nom de l'infirmier(ère)"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="verifie"
                    checked={formData.verifie || false}
                    onChange={(e) => setFormData({ ...formData, verifie: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="verifie" className="flex-1 cursor-pointer min-w-0">
                    <p className="text-sm font-medium text-gray-900">Marquer comme vérifié</p>
                    <p className="text-xs text-gray-500">Le soin a été vérifié et validé par un médecin</p>
                  </label>
                  {formData.verifie && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1 flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm sm:text-base order-2 sm:order-1"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Enregistrer le soin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}