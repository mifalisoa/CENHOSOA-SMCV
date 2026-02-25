import { useState } from 'react';
import type { CreateSoinInfirmierDTO } from '../../../../core/entities/SoinInfirmier';
import type { Patient } from '../../../../core/entities/Patient';

interface AddSoinInfirmierModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateSoinInfirmierDTO) => Promise<void>;
}

export default function AddSoinInfirmierModal({ patient, onClose, onSubmit }: AddSoinInfirmierModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<Partial<CreateSoinInfirmierDTO>>({
    id_patient: patient.id_patient,
    date_soin: new Date().toISOString().split('T')[0],
    heure_soin: new Date().toTimeString().slice(0, 5),
    verifie: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : au moins un champ de soin doit être rempli
    if (!formData.ecg && !formData.ecg_dii_long && !formData.injection_iv && 
        !formData.injection_im && !formData.pse && !formData.pansement && !formData.autre_soins) {
      setError('Veuillez renseigner au moins un type de soin');
      return;
    }

    if (!formData.realise_par) {
      setError('Veuillez indiquer qui a réalisé le soin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateSoinInfirmierDTO);
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
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">💉 Nouveau soin infirmier</h2>
              <p className="text-teal-100 text-sm">
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
            {/* Informations générales */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date et heure du soin
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du soin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_soin || ''}
                    onChange={(e) => setFormData({ ...formData, date_soin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.heure_soin || ''}
                    onChange={(e) => setFormData({ ...formData, heure_soin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Types de soins */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Types de soins infirmiers
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <span>📊</span> ECG
                    </label>
                    <input
                      type="text"
                      value={formData.ecg || ''}
                      onChange={(e) => setFormData({ ...formData, ecg: e.target.value })}
                      placeholder="Ex: Rythme sinusal, FC 75 bpm"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <span>📈</span> ECG + DII long
                    </label>
                    <input
                      type="text"
                      value={formData.ecg_dii_long || ''}
                      onChange={(e) => setFormData({ ...formData, ecg_dii_long: e.target.value })}
                      placeholder="Ex: Pas de trouble du rythme"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <span>💉</span> Injection intraveineuse (IV)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.injection_iv || ''}
                      onChange={(e) => setFormData({ ...formData, injection_iv: e.target.value })}
                      placeholder="Ex: Furosémide 40mg IV à 8h"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <span>💉</span> Injection intramusculaire (IM)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.injection_im || ''}
                      onChange={(e) => setFormData({ ...formData, injection_im: e.target.value })}
                      placeholder="Ex: Vitamine B12 1000µg IM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span>⚙️</span> PSE (Pousse-Seringue Électrique)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.pse || ''}
                    onChange={(e) => setFormData({ ...formData, pse: e.target.value })}
                    placeholder="Ex: Insuline rapide 2UI/h, réglage PSE"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span>🩹</span> Pansement
                  </label>
                  <textarea
                    rows={2}
                    value={formData.pansement || ''}
                    onChange={(e) => setFormData({ ...formData, pansement: e.target.value })}
                    placeholder="Ex: Réfection pansement plaie jambe droite, bonne cicatrisation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span>🔧</span> Autres soins
                  </label>
                  <textarea
                    rows={3}
                    value={formData.autre_soins || ''}
                    onChange={(e) => setFormData({ ...formData, autre_soins: e.target.value })}
                    placeholder="Ex: Pose de sonde urinaire, prélèvement sanguin, surveillance des constantes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Réalisé par et vérification */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Réalisation et vérification
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réalisé par *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.realise_par || ''}
                    onChange={(e) => setFormData({ ...formData, realise_par: e.target.value })}
                    placeholder="Nom de l'infirmier(ère)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="verifie"
                    checked={formData.verifie || false}
                    onChange={(e) => setFormData({ ...formData, verifie: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="verifie" className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">Marquer comme vérifié</p>
                    <p className="text-xs text-gray-500">Le soin a été vérifié et validé par un médecin</p>
                  </label>
                  {formData.verifie && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      ✓ Vérifié
                    </span>
                  )}
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
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
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
                Enregistrer le soin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}