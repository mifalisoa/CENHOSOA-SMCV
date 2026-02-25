import { useState } from 'react';
import { X, Calendar, Clock, User, Beaker, FlaskConical, Activity, FileText } from 'lucide-react';
import type { CreateBilanBiologiqueDTO } from '../../../../core/entities/BilanBiologique';
import type { Patient } from '../../../../core/entities/Patient';

interface AddBilanBiologiqueModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateBilanBiologiqueDTO) => Promise<void>;
}

export default function AddBilanBiologiqueModal({ patient, onClose, onSubmit }: AddBilanBiologiqueModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateBilanBiologiqueDTO>>({
    id_patient: patient.id_patient,
    date_prelevement: new Date().toISOString().split('T')[0],
    heure_prelevement: new Date().toTimeString().slice(0, 5),
    type_bilan: 'Bilan standard',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateBilanBiologiqueDTO);
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
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                <Beaker className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                Nouveau bilan biologique
              </h2>
              <p className="text-blue-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer le modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informations du prélèvement
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:p-4">
                <div>
                  <label htmlFor="date-prelevement" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de prélèvement *
                  </label>
                  <input
                    id="date-prelevement"
                    type="date"
                    required
                    value={formData.date_prelevement || ''}
                    onChange={(e) => setFormData({ ...formData, date_prelevement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="heure-prelevement" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Heure *
                  </label>
                  <input
                    id="heure-prelevement"
                    type="time"
                    required
                    value={formData.heure_prelevement || ''}
                    onChange={(e) => setFormData({ ...formData, heure_prelevement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="type-bilan" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de bilan
                  </label>
                  <select
                    id="type-bilan"
                    value={formData.type_bilan || ''}
                    onChange={(e) => setFormData({ ...formData, type_bilan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Bilan standard">Bilan standard</option>
                    <option value="Bilan rénal">Bilan rénal</option>
                    <option value="Bilan hépatique">Bilan hépatique</option>
                    <option value="Bilan lipidique">Bilan lipidique</option>
                    <option value="Bilan inflammatoire">Bilan inflammatoire</option>
                    <option value="NFS">NFS</option>
                    <option value="Bilan de coagulation">Bilan de coagulation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prescripteur" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Prescripteur
                  </label>
                  <input
                    id="prescripteur"
                    type="text"
                    value={formData.prescripteur || ''}
                    onChange={(e) => setFormData({ ...formData, prescripteur: e.target.value })}
                    placeholder="Dr. Nom Prénom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="laboratoire" className="block text-sm font-medium text-gray-700 mb-2">
                    Laboratoire
                  </label>
                  <input
                    id="laboratoire"
                    type="text"
                    value={formData.laboratoire || ''}
                    onChange={(e) => setFormData({ ...formData, laboratoire: e.target.value })}
                    placeholder="Nom du laboratoire"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Paramètres biologiques */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Résultats biologiques
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:p-4">
                <div>
                  <label htmlFor="creatinine" className="block text-sm font-medium text-gray-700 mb-2">
                    Créatinine (mg/L)
                  </label>
                  <div className="relative">
                    <input
                      id="creatinine"
                      type="number"
                      step="0.01"
                      value={formData.creatinine || ''}
                      onChange={(e) => setFormData({ ...formData, creatinine: parseFloat(e.target.value) || undefined })}
                      placeholder="Ex: 10.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">mg/L</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Norme: 7-13 mg/L</p>
                </div>

                <div>
                  <label htmlFor="glycemie" className="block text-sm font-medium text-gray-700 mb-2">
                    Glycémie (g/L)
                  </label>
                  <div className="relative">
                    <input
                      id="glycemie"
                      type="number"
                      step="0.01"
                      value={formData.glycemie || ''}
                      onChange={(e) => setFormData({ ...formData, glycemie: parseFloat(e.target.value) || undefined })}
                      placeholder="Ex: 0.95"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">g/L</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Norme: 0.70-1.10 g/L</p>
                </div>

                <div>
                  <label htmlFor="crp" className="block text-sm font-medium text-gray-700 mb-2">
                    CRP (mg/L)
                  </label>
                  <div className="relative">
                    <input
                      id="crp"
                      type="number"
                      step="0.1"
                      value={formData.crp || ''}
                      onChange={(e) => setFormData({ ...formData, crp: parseFloat(e.target.value) || undefined })}
                      placeholder="Ex: 5.2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">mg/L</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Norme: &lt; 5 mg/L</p>
                </div>

                <div>
                  <label htmlFor="inr" className="block text-sm font-medium text-gray-700 mb-2">
                    INR
                  </label>
                  <input
                    id="inr"
                    type="number"
                    step="0.01"
                    value={formData.inr || ''}
                    onChange={(e) => setFormData({ ...formData, inr: parseFloat(e.target.value) || undefined })}
                    placeholder="Ex: 1.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Norme: 0.8-1.2</p>
                </div>

                <div>
                  <label htmlFor="nfs" className="block text-sm font-medium text-gray-700 mb-2">
                    NFS (×10³/mm³)
                  </label>
                  <div className="relative">
                    <input
                      id="nfs"
                      type="number"
                      step="0.1"
                      value={formData.nfs || ''}
                      onChange={(e) => setFormData({ ...formData, nfs: parseFloat(e.target.value) || undefined })}
                      placeholder="Ex: 7.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">×10³</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Norme: 4-10 ×10³/mm³</p>
                </div>
              </div>
            </div>

            {/* Résultats et interprétation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Résultats complets et interprétation
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="resultat" className="block text-sm font-medium text-gray-700 mb-2">
                    Résultats détaillés
                  </label>
                  <textarea
                    id="resultat"
                    rows={4}
                    value={formData.resultat || ''}
                    onChange={(e) => setFormData({ ...formData, resultat: e.target.value })}
                    placeholder="Résultats complets du bilan biologique (autres paramètres, valeurs complètes...)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="interpretation" className="block text-sm font-medium text-gray-700 mb-2">
                    Interprétation
                  </label>
                  <textarea
                    id="interpretation"
                    rows={3}
                    value={formData.interpretation || ''}
                    onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                    placeholder="Interprétation clinique des résultats, anomalies détectées, recommandations..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
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
                <FlaskConical className="w-5 h-5" />
                Enregistrer le bilan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}