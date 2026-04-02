import { useState } from 'react';
import { X, Calendar, Clock, User, Beaker, FlaskConical, Activity, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CreateBilanBiologiqueDTO } from '../../../../core/entities/BilanBiologique';
import type { Patient } from '../../../../core/entities/Patient';

interface AddBilanBiologiqueModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateBilanBiologiqueDTO) => Promise<void>;
}

// ── Plages normales ───────────────────────────────────────────────────────────
const NORMES: Record<string, { min: number; max: number; unit: string; label: string }> = {
  creatinine: { min: 7,   max: 13,  unit: 'mg/L',   label: 'Créatinine'  },
  glycemie:   { min: 0.7, max: 1.1, unit: 'g/L',    label: 'Glycémie'    },
  crp:        { min: 0,   max: 5,   unit: 'mg/L',    label: 'CRP'         },
  inr:        { min: 0.8, max: 1.2, unit: '',         label: 'INR'         },
  nfs:        { min: 4,   max: 10,  unit: '×10³/mm³', label: 'NFS'        },
};

type NormStatus = 'normal' | 'high' | 'low' | null;

function getNormStatus(value: number | undefined, key: string): NormStatus {
  if (!value && value !== 0) return null;
  const n = NORMES[key];
  if (!n) return null;
  if (value < n.min) return 'low';
  if (value > n.max) return 'high';
  return 'normal';
}

// ── Composant champ valeur biologique ─────────────────────────────────────────
interface BilanFieldProps {
  id:       string;
  normKey:  string;
  value:    number | undefined;
  onChange: (v: number | undefined) => void;
}

function BilanField({ id, normKey, value, onChange }: BilanFieldProps) {
  const norme  = NORMES[normKey];
  const status = getNormStatus(value, normKey);

  // Couleur live selon la valeur saisie — vert si normal, rouge si hors norme
  const borderClass =
    status === 'normal' ? 'border-green-300 bg-green-50 focus:ring-green-100' :
    status === 'high' || status === 'low' ? 'border-red-300 bg-red-50 focus:ring-red-100' :
    'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100';

  const badge =
    status === 'normal' ? (
      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
        <CheckCircle2 className="w-2.5 h-2.5" />Normal
      </span>
    ) : status === 'high' ? (
      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
        <AlertTriangle className="w-2.5 h-2.5" />Élevé
      </span>
    ) : status === 'low' ? (
      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
        <AlertTriangle className="w-2.5 h-2.5" />Bas
      </span>
    ) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {norme?.label}
          {norme?.unit && <span className="text-gray-400 text-xs ml-1">({norme.unit})</span>}
        </label>
        {badge}
      </div>
      <div className="relative">
        <input
          id={id}
          type="number"
          step="0.01"
          value={value ?? ''}
          placeholder={`Norme : ${norme?.min}–${norme?.max}`}
          onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 pr-12 ${borderClass}`}
        />
        {norme?.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {norme.unit}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Norme : {norme?.min}–{norme?.max} {norme?.unit}</p>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const REQUIRED = ['type_bilan'] as const;

export default function AddBilanBiologiqueModal({ patient, onClose, onSubmit }: AddBilanBiologiqueModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateBilanBiologiqueDTO>>({
    id_patient:        patient.id_patient,
    date_prelevement:  new Date().toISOString().split('T')[0],
    heure_prelevement: new Date().toTimeString().slice(0, 5),
    type_bilan:        '',
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

  const isFormValid = REQUIRED.every(f => {
    const val = formData[f as keyof typeof formData];
    return val && String(val).trim() !== '';
  });

  const mark = (field: string) => setTouched(p => ({ ...p, [field]: true }));

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

  // Compte les valeurs hors norme parmi celles saisies
  const nbAbnormal = ['creatinine', 'glycemie', 'crp', 'inr', 'nfs'].filter(k => {
    const s = getNormStatus(formData[k as keyof typeof formData] as number | undefined, k);
    return s === 'high' || s === 'low';
  }).length;

  const nbFilled = ['creatinine', 'glycemie', 'crp', 'inr', 'nfs'].filter(k =>
    formData[k as keyof typeof formData] !== undefined && formData[k as keyof typeof formData] !== null
  ).length;

  // ── Soumission ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.fromEntries(REQUIRED.map(f => [f, true])));
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await onSubmit(formData as CreateBilanBiologiqueDTO);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header — cyan uniforme ── */}
        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Beaker className="w-5 h-5 shrink-0" />
              Nouveau bilan biologique
            </h2>
            <p className="text-cyan-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer le modal"
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

        <form id="bilan-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Section 1 — Informations prélèvement */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Informations du prélèvement
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-prelevement" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="date-prelevement" type="date" required title="Date du prélèvement"
                  value={formData.date_prelevement || ''}
                  onChange={e => setFormData({ ...formData, date_prelevement: e.target.value })}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="heure-prelevement" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Heure<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="heure-prelevement" type="time" required title="Heure du prélèvement"
                  value={formData.heure_prelevement || ''}
                  onChange={e => setFormData({ ...formData, heure_prelevement: e.target.value })}
                  className={inputBase} />
              </div>

              <div>
                {/* ✅ type_bilan obligatoire avec validation onBlur */}
                <Lbl field="type_bilan" htmlFor="type-bilan" req>Type de bilan</Lbl>
                <select id="type-bilan" title="Type de bilan"
                  value={formData.type_bilan || ''}
                  onChange={e => setFormData({ ...formData, type_bilan: e.target.value })}
                  onBlur={() => mark('type_bilan')}
                  className={cx('type_bilan')}>
                  <option value="">— Sélectionner —</option>
                  <option value="Bilan standard">Bilan standard</option>
                  <option value="Bilan rénal">Bilan rénal</option>
                  <option value="Bilan hépatique">Bilan hépatique</option>
                  <option value="Bilan lipidique">Bilan lipidique</option>
                  <option value="Bilan inflammatoire">Bilan inflammatoire</option>
                  <option value="NFS">NFS</option>
                  <option value="Bilan de coagulation">Bilan de coagulation</option>
                  <option value="Bilan cardiaque">Bilan cardiaque</option>
                  <option value="Autre">Autre</option>
                </select>
                <FieldErr field="type_bilan" />
              </div>

              <div>
                <label htmlFor="prescripteur" className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />Prescripteur
                </label>
                <input id="prescripteur" type="text" placeholder="Dr. Nom Prénom"
                  value={formData.prescripteur || ''}
                  onChange={e => setFormData({ ...formData, prescripteur: e.target.value })}
                  className={inputBase} />
              </div>

              <div className="col-span-2">
                <label htmlFor="laboratoire" className="text-sm font-medium text-gray-700 mb-1.5 block">Laboratoire</label>
                <input id="laboratoire" type="text" placeholder="Nom du laboratoire"
                  value={formData.laboratoire || ''}
                  onChange={e => setFormData({ ...formData, laboratoire: e.target.value })}
                  className={inputBase} />
              </div>
            </div>
          </div>

          {/* Section 2 — Valeurs biologiques avec feedback live ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Résultats biologiques
              </h3>
              {/* ✅ Résumé live hors normes */}
              {nbFilled > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  {nbAbnormal > 0 ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {nbAbnormal} valeur{nbAbnormal > 1 ? 's' : ''} hors norme
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Toutes normales
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <BilanField id="creatinine" normKey="creatinine"
                value={formData.creatinine as number | undefined}
                onChange={v => setFormData({ ...formData, creatinine: v })} />
              <BilanField id="glycemie" normKey="glycemie"
                value={formData.glycemie as number | undefined}
                onChange={v => setFormData({ ...formData, glycemie: v })} />
              <BilanField id="crp" normKey="crp"
                value={formData.crp as number | undefined}
                onChange={v => setFormData({ ...formData, crp: v })} />
              <BilanField id="inr" normKey="inr"
                value={formData.inr as number | undefined}
                onChange={v => setFormData({ ...formData, inr: v })} />
              <BilanField id="nfs" normKey="nfs"
                value={formData.nfs as number | undefined}
                onChange={v => setFormData({ ...formData, nfs: v })} />
            </div>

            <p className="text-[10px] text-gray-400">
              Les champs passent en vert si dans la norme, en rouge si hors norme — en temps réel.
            </p>
          </div>

          {/* Section 3 — Résultats et interprétation */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Résultats complets et interprétation
            </h3>
            <div>
              <label htmlFor="resultat" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Résultats détaillés
              </label>
              <textarea id="resultat" rows={4}
                value={formData.resultat || ''}
                onChange={e => setFormData({ ...formData, resultat: e.target.value })}
                placeholder="Résultats complets du bilan biologique (autres paramètres, valeurs complètes...)"
                className={`${inputBase} resize-none`} />
            </div>
            <div>
              <label htmlFor="interpretation" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Interprétation clinique
              </label>
              <textarea id="interpretation" rows={3}
                value={formData.interpretation || ''}
                onChange={e => setFormData({ ...formData, interpretation: e.target.value })}
                placeholder="Anomalies détectées, interprétation clinique, recommandations..."
                className={`${inputBase} resize-none`} />
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
          {/* ✅ type="submit" lié au form — bouton grisé si invalide */}
          <button type="submit" form="bilan-form" disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isFormValid && !loading
                ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><FlaskConical className="w-4 h-4" />Enregistrer le bilan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}