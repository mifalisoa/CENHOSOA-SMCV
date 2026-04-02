import { useState } from 'react';
import { X, Calendar, Clock, Heart, User, FileText, CheckCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import type { Patient } from '../../../../core/entities/Patient';

interface AddSoinMedicalModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateSoinMedicalDTO) => Promise<void>;
}

const REQUIRED = ['realise_par'] as const;

export default function AddSoinMedicalModal({ patient, onClose, onSubmit }: AddSoinMedicalModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateSoinMedicalDTO>>({
    id_patient: patient.id_patient,
    date_soin:  new Date().toISOString().split('T')[0],
    heure_soin: new Date().toTimeString().slice(0, 5),
    verifie:    false,
  });

  // ── Validation ────────────────────────────────────────────────────────────────
  const getError = (field: string): string | null => {
    if (!touched[field]) return null;
    if (REQUIRED.includes(field as typeof REQUIRED[number])) {
      const val = formData[field as keyof typeof formData];
      if (!val || String(val).trim() === '') return 'Champ obligatoire';
    }
    return null;
  };

  const hasAtLeastOneSoin = !!(formData.ett || formData.eto || formData.autre);

  const isFormValid =
    REQUIRED.every(f => {
      const val = formData[f as keyof typeof formData];
      return val && String(val).trim() !== '';
    }) && hasAtLeastOneSoin;

  const mark = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  // ── Classes input ─────────────────────────────────────────────────────────────
  // 3 couleurs : cyan (normal), rouge (erreur), vert (ok)
  const cx = (field: string) => {
    const err = getError(field);
    const val = formData[field as keyof typeof formData];
    const ok  = touched[field] && !err && val && String(val).trim();
    return `w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
      err ? 'border-red-300 bg-red-50 focus:ring-red-100'
      : ok ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100'
    }`;
  };

  // ── Label avec icône ✓ / ⚠️ ──────────────────────────────────────────────────
  const Lbl = ({ field, children, req, htmlFor }: {
    field: string; children: React.ReactNode; req?: boolean; htmlFor?: string;
  }) => {
    const err = getError(field);
    const val = formData[field as keyof typeof formData];
    const ok  = touched[field] && !err && val && String(val).trim();
    return (
      <label htmlFor={htmlFor ?? field}
        className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
        <span>{children}{req && <span className="text-red-500 ml-0.5">*</span>}</span>
        {ok  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
        {err && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
      </label>
    );
  };

  const FieldErr = ({ field }: { field: string }) => {
    const e = getError(field);
    return e
      ? <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{e}</p>
      : null;
  };

  // ── Soumission ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Marque tous les champs obligatoires
    setTouched(Object.fromEntries(REQUIRED.map(f => [f, true])));
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

        {/* ── Header — cyan uniforme ── */}
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

        {/* Erreur globale */}
        {submitError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        {/* ── Formulaire ── */}
        <form id="soin-medical-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Section 1 — Date et heure */}
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

          {/* Section 2 — Types de soins */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Types de soins réalisés
              </h3>
              {/* ✅ Alerte si aucun soin rempli et au moins 1 champ touché */}
              {!hasAtLeastOneSoin && Object.keys(touched).length > 0 && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Au moins un soin requis
                </span>
              )}
            </div>

            {/* ETT */}
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

            {/* ETO */}
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

            {/* Autre */}
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

          {/* Section 3 — Réalisation */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Réalisation et vérification
            </h3>

            <div>
              {/* ✅ Label avec icône ✓/⚠️ */}
              <Lbl field="realise_par" htmlFor="realise-par" req>Réalisé par</Lbl>
              <input id="realise-par" type="text" required
                title="Nom du médecin ou de l'infirmier(ère)"
                value={formData.realise_par || ''}
                placeholder="Dr. Nom Prénom ou Nom de l'infirmier(ère)"
                onChange={e => setFormData({ ...formData, realise_par: e.target.value })}
                onBlur={() => mark('realise_par')}
                className={cx('realise_par')} />
              <FieldErr field="realise_par" />
            </div>

            {/* Checkbox vérification */}
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

        {/* ── Footer ── */}
        <div className="border-t bg-gray-50 px-5 py-4 flex justify-end items-center gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
            Annuler
          </button>
          {/* ✅ type="submit" lié au form — plus de onClick direct */}
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