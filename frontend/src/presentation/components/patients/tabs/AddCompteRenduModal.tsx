import { useState } from 'react';
import { X, Calendar, User, FileText, Pill, MapPin, CheckCircle2, TrendingUp, ArrowRight, Skull, AlertTriangle } from 'lucide-react';
import type { CreateCompteRenduDTO } from '../../../../core/entities/CompteRendu';
import type { Patient } from '../../../../core/entities/Patient';

interface AddCompteRenduModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateCompteRenduDTO) => Promise<void>;
}

type ModaliteSortie = 'gueri' | 'ameliore' | 'transfert' | 'deces';

// ── Champs obligatoires ───────────────────────────────────────────────────────
const REQUIRED = ['medecin', 'resume_observation', 'diagnostic_sortie', 'traitement_sortie'] as const;

export default function AddCompteRenduModal({ patient, onClose, onSubmit }: AddCompteRenduModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateCompteRenduDTO>>({
    id_patient:      patient.id_patient,
    date_admission:  new Date().toISOString().split('T')[0],
    date_sortie:     new Date().toISOString().split('T')[0],
    modalite_sortie: 'ameliore',
  });

  // ── Validation ────────────────────────────────────────────────────────────────
  const getError = (field: string): string | null => {
    if (!touched[field]) return null;

    // Champs texte obligatoires
    if (REQUIRED.includes(field as typeof REQUIRED[number])) {
      const val = formData[field as keyof typeof formData];
      if (!val || String(val).trim() === '') return 'Champ obligatoire';
    }

    // Date sortie >= date admission
    if (field === 'date_sortie' && formData.date_admission && formData.date_sortie) {
      if (new Date(formData.date_sortie) < new Date(formData.date_admission)) {
        return 'La date de sortie doit être après la date d\'admission';
      }
    }

    // Lieu de transfert requis si modalité = transfert
    if (field === 'lieu_transfert' && formData.modalite_sortie === 'transfert') {
      if (!formData.lieu_transfert?.trim()) return 'Lieu de transfert obligatoire';
    }

    return null;
  };

  const isFormValid =
    REQUIRED.every(f => {
      const val = formData[f as keyof typeof formData];
      return val && String(val).trim() !== '';
    }) &&
    (!formData.date_sortie || !formData.date_admission ||
      new Date(formData.date_sortie) >= new Date(formData.date_admission)) &&
    (formData.modalite_sortie !== 'transfert' || !!formData.lieu_transfert?.trim());

  const mark = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  // ── Classes input ─────────────────────────────────────────────────────────────
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
    // Marque tous les champs obligatoires + dates + lieu transfert si applicable
    const fields = [...REQUIRED, 'date_sortie'];
    if (formData.modalite_sortie === 'transfert') fields.push('lieu_transfert');
    setTouched(Object.fromEntries(fields.map(f => [f, true])));
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    try {
      await onSubmit(formData as CreateCompteRenduDTO);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-cyan-400 focus:ring-cyan-100';

  const modaliteOptions = [
    { value: 'gueri',     label: 'Guéri',     icon: CheckCircle2, emoji: '✅' },
    { value: 'ameliore',  label: 'Amélioré',  icon: TrendingUp,   emoji: '📈' },
    { value: 'transfert', label: 'Transféré', icon: ArrowRight,   emoji: '🚑' },
    { value: 'deces',     label: 'Décès',     icon: Skull,        emoji: '⚫' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header — cyan uniforme ── */}
        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 shrink-0" />
              Nouveau compte rendu d'hospitalisation
            </h2>
            <p className="text-cyan-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
            </p>
          </div>
          <button onClick={onClose} title="Fermer" aria-label="Fermer"
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

        <form id="add-cr-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Section 1 : Dates d'hospitalisation ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Période d'hospitalisation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date_admission" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date d'admission<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="date_admission" type="date" required title="Date d'admission"
                  value={formData.date_admission || ''}
                  onChange={e => setFormData({ ...formData, date_admission: e.target.value })}
                  onBlur={() => { mark('date_admission'); mark('date_sortie'); }}
                  className={inputBase} />
              </div>
              <div>
                {/* ✅ Validation date sortie >= admission */}
                <Lbl field="date_sortie" htmlFor="date_sortie" req>Date de sortie</Lbl>
                <input id="date_sortie" type="date" required title="Date de sortie"
                  min={formData.date_admission || ''}
                  value={formData.date_sortie || ''}
                  onChange={e => setFormData({ ...formData, date_sortie: e.target.value })}
                  onBlur={() => mark('date_sortie')}
                  className={cx('date_sortie')} />
                <FieldErr field="date_sortie" />
              </div>
            </div>
          </div>

          {/* ── Section 2 : Médecin ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Médecin responsable
            </h3>
            <div>
              <Lbl field="medecin" htmlFor="medecin_responsable" req>Nom du médecin</Lbl>
              <input id="medecin_responsable" type="text" required
                title="Nom du médecin responsable"
                value={formData.medecin || ''}
                placeholder="Dr. Nom Prénom"
                onChange={e => setFormData({ ...formData, medecin: e.target.value })}
                onBlur={() => mark('medecin')}
                className={cx('medecin')} />
              <FieldErr field="medecin" />
            </div>
          </div>

          {/* ── Section 3 : Résumé ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Résumé de l'observation
            </h3>
            <div>
              <Lbl field="resume_observation" htmlFor="resume_obs" req>
                Résumé complet de l'hospitalisation
              </Lbl>
              <textarea id="resume_obs" rows={6} required
                title="Résumé de l'observation"
                value={formData.resume_observation || ''}
                placeholder="Décrivez le déroulement de l'hospitalisation, les soins réalisés, l'évolution clinique..."
                onChange={e => setFormData({ ...formData, resume_observation: e.target.value })}
                onBlur={() => mark('resume_observation')}
                className={`${cx('resume_observation')} resize-none`} />
              <FieldErr field="resume_observation" />
            </div>
          </div>

          {/* ── Section 4 : Diagnostic de sortie ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diagnostic de sortie
            </h3>
            <div>
              <Lbl field="diagnostic_sortie" htmlFor="diag_sortie" req>Diagnostic final</Lbl>
              <input id="diag_sortie" type="text" required
                title="Diagnostic de sortie"
                value={formData.diagnostic_sortie || ''}
                placeholder="Ex: Insuffisance cardiaque décompensée, Pneumonie communautaire..."
                onChange={e => setFormData({ ...formData, diagnostic_sortie: e.target.value })}
                onBlur={() => mark('diagnostic_sortie')}
                className={cx('diagnostic_sortie')} />
              <FieldErr field="diagnostic_sortie" />
            </div>
          </div>

          {/* ── Section 5 : Traitement de sortie ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-3.5 h-3.5" />
              Traitement de sortie
            </h3>
            <div>
              <Lbl field="traitement_sortie" htmlFor="traitement_sortie" req>
                Prescriptions à la sortie
              </Lbl>
              <textarea id="traitement_sortie" rows={4} required
                title="Traitement de sortie"
                value={formData.traitement_sortie || ''}
                placeholder="Liste des médicaments, posologie, durée de traitement..."
                onChange={e => setFormData({ ...formData, traitement_sortie: e.target.value })}
                onBlur={() => mark('traitement_sortie')}
                className={`${cx('traitement_sortie')} resize-none`} />
              <FieldErr field="traitement_sortie" />
            </div>
          </div>

          {/* ── Section 6 : Modalité de sortie ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5" />
              Modalité de sortie
            </h3>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                État du patient à la sortie<span className="text-red-500 ml-0.5">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {modaliteOptions.map(({ value, label, emoji }) => (
                  <button key={value} type="button"
                    onClick={() => setFormData({ ...formData, modalite_sortie: value as ModaliteSortie })}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      formData.modalite_sortie === value
                        ? value === 'gueri'
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                    <span className="text-xl">{emoji}</span>
                    <span className="font-semibold text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Champ lieu de transfert conditionnel avec validation */}
            {formData.modalite_sortie === 'transfert' && (
              <div>
                <Lbl field="lieu_transfert" htmlFor="lieu_transfert" req>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Lieu de transfert
                  </span>
                </Lbl>
                <input id="lieu_transfert" type="text" required
                  title="Lieu de transfert"
                  value={formData.lieu_transfert || ''}
                  placeholder="Ex: CHU d'Antananarivo, Hôpital régional..."
                  onChange={e => setFormData({ ...formData, lieu_transfert: e.target.value })}
                  onBlur={() => mark('lieu_transfert')}
                  className={cx('lieu_transfert')} />
                <FieldErr field="lieu_transfert" />
              </div>
            )}
          </div>

          {/* ── Section 7 : Suivi ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Suivi post-hospitalisation
            </h3>
            <div>
              <label htmlFor="prochain_rdv" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Prochain rendez-vous
                <span className="text-gray-400 font-normal ml-1 text-xs">(optionnel)</span>
              </label>
              <input id="prochain_rdv" type="text"
                value={formData.prochain_rdv || ''}
                placeholder="Ex: Consultation de suivi dans 1 semaine..."
                onChange={e => setFormData({ ...formData, prochain_rdv: e.target.value })}
                className={inputBase} />
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
          {/* ✅ Bouton grisé si formulaire invalide */}
          <button type="submit" form="add-cr-form" disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isFormValid && !loading
                ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer le compte rendu</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}