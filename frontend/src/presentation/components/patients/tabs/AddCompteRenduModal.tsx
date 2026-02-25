import { useState } from 'react';
import { X, Calendar, User, FileText, Pill, MapPin, CheckCircle2, TrendingUp, ArrowRight, Skull } from 'lucide-react';
import type { CreateCompteRenduDTO } from '../../../../core/entities/CompteRendu';
import type { Patient } from '../../../../core/entities/Patient';

interface AddCompteRenduModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateCompteRenduDTO) => Promise<void>;
}

type ModaliteSortie = 'gueri' | 'ameliore' | 'transfert' | 'deces';

export default function AddCompteRenduModal({ patient, onClose, onSubmit }: AddCompteRenduModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateCompteRenduDTO>>({
    id_patient: patient.id_patient,
    id_admission: 0,
    date_admission: new Date().toISOString().split('T')[0],
    date_sortie: new Date().toISOString().split('T')[0],
    modalite_sortie: 'ameliore',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resume_observation || !formData.diagnostic_sortie || !formData.traitement_sortie) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.modalite_sortie === 'transfert' && !formData.lieu_transfert) {
      setError('Veuillez préciser le lieu de transfert');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateCompteRenduDTO);
      onClose();
    } catch (err) {
      // Fix: @typescript-eslint/no-explicit-any
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const modaliteOptions = [
    { value: 'gueri', label: 'Guéri', icon: CheckCircle2, color: 'green' },
    { value: 'ameliore', label: 'Amélioré', icon: TrendingUp, color: 'blue' },
    { value: 'transfert', label: 'Transféré', icon: ArrowRight, color: 'orange' },
    { value: 'deces', label: 'Décès', icon: Skull, color: 'gray' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Nouveau compte rendu d'hospitalisation
              </h2>
              <p className="text-blue-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              title="Fermer le formulaire"
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
        <form id="add-cr-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Période d'hospitalisation
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date_admission" className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'admission *
                  </label>
                  <input
                    id="date_admission"
                    type="date"
                    required
                    value={formData.date_admission || ''}
                    onChange={(e) => setFormData({ ...formData, date_admission: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="date_sortie" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de sortie *
                  </label>
                  <input
                    id="date_sortie"
                    type="date"
                    required
                    value={formData.date_sortie || ''}
                    onChange={(e) => setFormData({ ...formData, date_sortie: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h3 className="font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Médecin responsable
              </h3>
              <div>
                <label htmlFor="medecin_responsable" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du médecin *
                </label>
                <input
                  id="medecin_responsable"
                  type="text"
                  required
                  value={formData.medecin || ''}
                  onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
                  placeholder="Dr. Nom Prénom"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Résumé de l'observation
              </h3>
              <div>
                <label htmlFor="resume_obs" className="block text-sm font-medium text-gray-700 mb-2">
                  Résumé complet de l'hospitalisation *
                </label>
                <textarea
                  id="resume_obs"
                  rows={6}
                  required
                  value={formData.resume_observation || ''}
                  onChange={(e) => setFormData({ ...formData, resume_observation: e.target.value })}
                  placeholder="Décrivez le déroulement de l'hospitalisation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Diagnostic de sortie
              </h3>
              <div>
                <label htmlFor="diag_sortie" className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic final *
                </label>
                <input
                  id="diag_sortie"
                  type="text"
                  required
                  value={formData.diagnostic_sortie || ''}
                  onChange={(e) => setFormData({ ...formData, diagnostic_sortie: e.target.value })}
                  placeholder="Ex: Pneumonie communautaire..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Traitement de sortie
              </h3>
              <div>
                <label htmlFor="traitement_sortie" className="block text-sm font-medium text-gray-700 mb-2">
                  Prescriptions à la sortie *
                </label>
                <textarea
                  id="traitement_sortie"
                  rows={4}
                  required
                  value={formData.traitement_sortie || ''}
                  onChange={(e) => setFormData({ ...formData, traitement_sortie: e.target.value })}
                  placeholder="Liste complète des médicaments..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Modalité de sortie
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-3">
                    État du patient à la sortie *
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {modaliteOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.modalite_sortie === option.value;
                      const colorClasses = {
                        green: isSelected ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        blue: isSelected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        orange: isSelected ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        gray: isSelected ? 'border-gray-500 bg-gray-50 text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                      };

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, modalite_sortie: option.value as ModaliteSortie })}
                          className={`p-3 rounded-lg border-2 transition-all ${colorClasses[option.color as keyof typeof colorClasses]}`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold text-sm">{option.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.modalite_sortie === 'transfert' && (
                  <div>
                    <label htmlFor="lieu_transfert" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Lieu de transfert *
                    </label>
                    <input
                      id="lieu_transfert"
                      type="text"
                      required
                      value={formData.lieu_transfert || ''}
                      onChange={(e) => setFormData({ ...formData, lieu_transfert: e.target.value })}
                      placeholder="Ex: CHU de Antananarivo..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Suivi post-hospitalisation
              </h3>
              <div>
                <label htmlFor="prochain_rdv" className="block text-sm font-medium text-gray-700 mb-2">
                  Prochain rendez-vous (optionnel)
                </label>
                <input
                  id="prochain_rdv"
                  type="text"
                  value={formData.prochain_rdv || ''}
                  onChange={(e) => setFormData({ ...formData, prochain_rdv: e.target.value })}
                  placeholder="Ex: Consultation de suivi dans 1 semaine..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
            form="add-cr-form"
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
                <CheckCircle2 className="w-5 h-5" />
                Enregistrer le compte rendu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}