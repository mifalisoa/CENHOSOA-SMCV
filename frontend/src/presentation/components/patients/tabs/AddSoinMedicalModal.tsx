import { useState } from 'react';
import { X, Calendar, Clock, Heart, User, FileText, CheckCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import type { Patient } from '../../../../core/entities/Patient';

interface AddSoinMedicalModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateSoinMedicalDTO) => Promise<void>;
}

export default function AddSoinMedicalModal({ patient, onClose, onSubmit }: AddSoinMedicalModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted,   setSubmitted]   = useState(false);

  const [formData, setFormData] = useState<Partial<CreateSoinMedicalDTO>>({
    id_patient: patient.id_patient,
    date_soin:  new Date().toISOString().split('T')[0],
    heure_soin: new Date().toTimeString().slice(0, 5),
    verifie:    false,
  });

  const hasAtLeastOneSoin = !!(formData.ett || formData.eto || formData.autre);
  const isFormValid = hasAtLeastOneSoin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await onSubmit(formData as CreateSoinMedicalDTO);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-cyan-400 focus:ring-cyan-100';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 shrink-0" />
              Nouveau soin médical
            </h2>
            <p className="text-cyan-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <form id="soin-medical-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Date et heure du soin
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-soin" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date du soin<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="date-soin" type="date" required title="Date du soin"
                  value={formData.date_soin || ''}
                  onChange={e => setFormData({ ...formData, date_soin: e.target.value })}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="heure-soin" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Heure<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="heure-soin" type="time" required title="Heure du soin"
                  value={formData.heure_soin || ''}
                  onChange={e => setFormData({ ...formData, heure_soin: e.target.value })}
                  className={inputBase} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Types de soins réalisés
              </h3>
              {!hasAtLeastOneSoin && submitted && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Au moins un soin requis
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="ett" className="text-sm font-medium text-gray-700">
                  ETT — Échocardiographie Transthoracique
                </label>
                {formData.ett?.trim() && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                )}
              </div>
              <textarea id="ett" rows={3}
                value={formData.ett || ''}
                onChange={e => setFormData({ ...formData, ett: e.target.value })}
                placeholder="Ex : FE VG 55%, cavités normales, pas d'épanchement péricardique..."
                className={`${inputBase} resize-none ${formData.ett?.trim() ? 'border-green-300 bg-green-50' : ''}`} />
              <p className="text-[10px] text-gray-400 mt-1">
                Fraction d'éjection, dimensions cavitaires, valves, péricarde...
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="eto" className="text-sm font-medium text-gray-700">
                  ETO — Échocardiographie Transœsophagienne
                </label>
                {formData.eto?.trim() && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                )}
              </div>
              <textarea id="eto" rows={3}
                value={formData.eto || ''}
                onChange={e => setFormData({ ...formData, eto: e.target.value })}
                placeholder="Ex : Absence de thrombus intra-auriculaire gauche, valve mitrale normale..."
                className={`${inputBase} resize-none ${formData.eto?.trim() ? 'border-green-300 bg-green-50' : ''}`} />
              <p className="text-[10px] text-gray-400 mt-1">
                Thrombus, valves, septum, aorte thoracique...
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="autre" className="text-sm font-medium text-gray-700">
                  Autre soin médical
                </label>
                {formData.autre?.trim() && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                )}
              </div>
              <textarea id="autre" rows={3}
                value={formData.autre || ''}
                onChange={e => setFormData({ ...formData, autre: e.target.value })}
                placeholder="Ex : Pose de cathéter central, ponction d'ascite, drainage pleural..."
                className={`${inputBase} resize-none ${formData.autre?.trim() ? 'border-green-300 bg-green-50' : ''}`} />
              <p className="text-[10px] text-gray-400 mt-1">
                Tout autre soin ou examen médical réalisé lors de cette séance.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Vérification
            </h3>

            <div className={`flex items-center gap-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer ${
              formData.verifie ? 'border-green-300' : 'border-gray-200 hover:border-gray-300'
            }`}
              onClick={() => setFormData({ ...formData, verifie: !formData.verifie })}>
              <input type="checkbox" id="verifie" readOnly
                checked={formData.verifie || false}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 pointer-events-none" />
              <label htmlFor="verifie" className="flex-1 cursor-pointer min-w-0">
                <p className="text-sm font-medium text-gray-900">Marquer comme vérifié</p>
                <p className="text-xs text-gray-500">Le soin a été vérifié et validé par un médecin</p>
              </label>
              {formData.verifie && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3 h-3" />
                  Vérifié
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Champs obligatoires</p>
        </form>

        <div className="border-t bg-gray-50 px-5 py-4 flex justify-end items-center gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
            Annuler
          </button>
          <button type="submit" form="soin-medical-form" disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isFormValid && !loading
                ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer le soin</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}