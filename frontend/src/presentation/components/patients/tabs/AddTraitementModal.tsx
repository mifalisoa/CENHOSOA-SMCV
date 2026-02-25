import { useState } from 'react';
import { X, Calendar, Clock, User, MapPin, Pill, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
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

  const [formData, setFormData] = useState<Partial<CreateTraitementDTO>>({
    id_patient: patient.id_patient,
    date_prescription: new Date().toISOString().split('T')[0],
    heure_prescription: new Date().toTimeString().slice(0, 5),
    type_document: 'ordonnance',
    voie_administration: 'per os',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicament || !formData.dosage || !formData.frequence || !formData.duree) {
      setError('Veuillez remplir tous les champs obligatoires (médicament, dosage, fréquence, durée)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateTraitementDTO);
      onClose();
    } catch (err) {
      // Fix: @typescript-eslint/no-explicit-any
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Pill className="w-7 h-7" />
                Nouvelle prescription
              </h2>
              <p className="text-blue-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              title="Fermer la modal"
              aria-label="Fermer"
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Form Content */}
        <form id="add-traitement-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Type et informations générales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Type de document et informations
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document *
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type_document: 'ordonnance' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type_document === 'ordonnance'
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
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
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">💊</div>
                      <div className="text-sm font-semibold">Traitement</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="date_prescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date de prescription *
                  </label>
                  <input
                    id="date_prescription"
                    type="date"
                    required
                    value={formData.date_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, date_prescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="heure_prescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Heure *
                  </label>
                  <input
                    id="heure_prescription"
                    type="time"
                    required
                    value={formData.heure_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, heure_prescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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

                <div>
                  <label htmlFor="lieu_prescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Lieu de prescription
                  </label>
                  <input
                    id="lieu_prescription"
                    type="text"
                    value={formData.lieu_prescription || ''}
                    onChange={(e) => setFormData({ ...formData, lieu_prescription: e.target.value })}
                    placeholder="Ex: Hôpital, Cabinet..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="diagnostic" className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic
                  </label>
                  <input
                    id="diagnostic"
                    type="text"
                    value={formData.diagnostic || ''}
                    onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                    placeholder="Ex: HTA, Diabète type 2..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Médicament */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h3 className="font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Médicament et posologie
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="medicament" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du médicament *
                  </label>
                  <input
                    id="medicament"
                    type="text"
                    required
                    value={formData.medicament || ''}
                    onChange={(e) => setFormData({ ...formData, medicament: e.target.value })}
                    placeholder="Ex: Paracétamol, Amoxicilline..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      id="dosage"
                      type="text"
                      required
                      value={formData.dosage || ''}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="Ex: 500mg, 1g..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="voie_administration" className="block text-sm font-medium text-gray-700 mb-2">
                      Voie d'administration *
                    </label>
                    <select
                      id="voie_administration"
                      required
                      title="Sélectionner la voie d'administration"
                      value={formData.voie_administration || ''}
                      onChange={(e) => setFormData({ ...formData, voie_administration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frequence" className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence *
                    </label>
                    <input
                      id="frequence"
                      type="text"
                      required
                      value={formData.frequence || ''}
                      onChange={(e) => setFormData({ ...formData, frequence: e.target.value })}
                      placeholder="Ex: 3x/jour, toutes les 8h..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée *
                    </label>
                    <input
                      id="duree"
                      type="text"
                      required
                      value={formData.duree || ''}
                      onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                      placeholder="Ex: 7 jours, 1 mois..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions et observations */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Instructions et observations
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions de prise
                  </label>
                  <textarea
                    id="instructions"
                    rows={3}
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Ex: À prendre pendant les repas, à jeun, le soir au coucher..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="observations_speciales" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Observations spéciales / Précautions
                  </label>
                  <textarea
                    id="observations_speciales"
                    rows={3}
                    value={formData.observations_speciales || ''}
                    onChange={(e) => setFormData({ ...formData, observations_speciales: e.target.value })}
                    placeholder="Ex: Surveiller fonction rénale, contre-indiqué en cas d'allergie..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            form="add-traitement-form"
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Enregistrer la prescription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}