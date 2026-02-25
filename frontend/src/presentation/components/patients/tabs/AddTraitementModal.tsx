import { useState } from 'react';
import type { CreateTraitementDTO } from '../../../../core/entities/Traitement';
import type { Patient } from '../../../../core/entities/Patient';

interface AddTraitementModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateTraitementDTO) => Promise<void>;
}

export default function AddTraitementModal({ patient, onClose, onSubmit }: AddTraitementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<Partial<CreateTraitementDTO>>({
    id_patient: patient.id_patient,
    date_prescription: new Date().toISOString().split('T')[0],
    heure_prescription: new Date().toTimeString().slice(0, 5),
    type_document: 'ordonnance',
    voie_administration: 'per os',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.medicament || !formData.dosage || !formData.frequence || !formData.duree) {
      setError('Veuillez remplir tous les champs obligatoires (médicament, dosage, fréquence, durée)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateTraitementDTO);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">💊 Nouvelle prescription</h2>
              <p className="text-indigo-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
            {/* Type et informations générales */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Type de document et informations
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:p-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type_document: 'ordonnance' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type_document === 'ordonnance'
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">📋</div>
                      <div className="text-sm font-semibold">Ordonnance</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type_document: 'traitement' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type_document === 'traitement'
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">💊</div>
                      <div className="text-sm font-semibold">Traitement</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de prescription *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, date_prescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.heure_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, heure_prescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescripteur
                  </label>
                  <input
                    type="text"
                    value={formData.prescripteur || ''}
                    onChange={(e) => setFormData({ ...formData, prescripteur: e.target.value })}
                    placeholder="Dr. Nom Prénom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu de prescription
                  </label>
                  <input
                    type="text"
                    value={formData.lieu_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, lieu_prescription: e.target.value })}
                    placeholder="Ex: Hôpital, Cabinet..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic
                  </label>
                  <input
                    type="text"
                    value={formData.diagnostic || ''}
                    onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                    placeholder="Ex: HTA, Diabète type 2..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Médicament */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Médicament et posologie
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du médicament *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicament || ''}
                    onChange={(e) => setFormData({ ...formData, medicament: e.target.value })}
                    placeholder="Ex: Paracétamol, Amoxicilline..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dosage || ''}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="Ex: 500mg, 1g..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voie d'administration *
                    </label>
                    <select
                      required
                      value={formData.voie_administration || ''}
                      onChange={(e) => setFormData({ ...formData, voie_administration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="per os">Per os (orale)</option>
                      <option value="IV">IV (intraveineuse)</option>
                      <option value="IM">IM (intramusculaire)</option>
                      <option value="SC">SC (sous-cutanée)</option>
                      <option value="topique">Topique</option>
                      <option value="rectale">Rectale</option>
                      <option value="inhalation">Inhalation</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.frequence || ''}
                      onChange={(e) => setFormData({ ...formData, frequence: e.target.value })}
                      placeholder="Ex: 3x/jour, toutes les 8h..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.duree || ''}
                      onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                      placeholder="Ex: 7 jours, 1 mois..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions et observations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions et observations
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions de prise
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Ex: À prendre pendant les repas, à jeun, le soir au coucher..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span>⚠️</span> Observations spéciales / Précautions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observations_speciales || ''}
                    onChange={(e) => setFormData({ ...formData, observations_speciales: e.target.value })}
                    placeholder="Ex: Surveiller fonction rénale, contre-indiqué en cas d'allergie..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer la prescription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}