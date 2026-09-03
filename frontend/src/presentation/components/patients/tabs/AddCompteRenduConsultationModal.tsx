import { useState } from 'react';
import { X, Calendar, FileText, Pill, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import type { CreateCompteRenduConsultationDTO } from '../../../../core/entities/CompteRenduConsultation';
import type { Patient } from '../../../../core/entities/Patient';

interface AddCompteRenduConsultationModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateCompteRenduConsultationDTO) => Promise<void>;
}

// Champs obligatoires
const REQUIRED = ['motif_consultation', 'diagnostic', 'traitement'] as const;

export default function AddCompteRenduConsultationModal({ patient, onClose, onSubmit }: AddCompteRenduConsultationModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateCompteRenduConsultationDTO>>({
    id_patient:        patient.id_patient,
    date_consultation: new Date().toISOString().split('T')[0],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(Object.fromEntries(REQUIRED.map(f => [f, true])));
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        date_consultation: new Date(formData.date_consultation + 'T00:00:00').toISOString(),
      };
      await onSubmit(payload as CreateCompteRenduConsultationDTO);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-cyan-400 focus:ring-cyan-100';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 shrink-0" />
              Nouveau compte rendu de consultation
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

        {submitError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <form id="add-crc-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Date de consultation — une seule date, pas de plage */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Date de consultation
            </h3>
            <input id="date_consultation" type="date" required title="Date de consultation"
              value={formData.date_consultation || ''}
              onChange={e => setFormData({ ...formData, date_consultation: e.target.value })}
              className={inputBase} />
          </div>

          {/* Motif de consultation */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Motif de consultation
            </h3>
            <div>
              <Lbl field="motif_consultation" htmlFor="motif_consultation" req>
                Pourquoi le patient consulte
              </Lbl>
              <textarea id="motif_consultation" rows={3} required
                title="Motif de consultation"
                value={formData.motif_consultation || ''}
                placeholder="Ex: Douleur thoracique, suivi post-hospitalisation, bilan de controle..."
                onChange={e => setFormData({ ...formData, motif_consultation: e.target.value })}
                onBlur={() => mark('motif_consultation')}
                className={`${cx('motif_consultation')} resize-none`} />
              <FieldErr field="motif_consultation" />
            </div>
          </div>

          {/* Contexte */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Contexte
              <span className="text-gray-400 font-normal normal-case text-[11px]">(optionnel)</span>
            </h3>
            <textarea rows={4}
              value={formData.contexte || ''}
              placeholder="Antecedents, facteurs de risque, hospitalisations precedentes..."
              onChange={e => setFormData({ ...formData, contexte: e.target.value })}
              className={`${inputBase} resize-none`} />
          </div>

          {/* Examens paracliniques */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Examens paracliniques
              <span className="text-gray-400 font-normal normal-case text-[11px]">(optionnel)</span>
            </h3>
            <textarea rows={4}
              value={formData.examens_paracliniques || ''}
              placeholder="Biologie, radiographie, ECG, echocardiographie..."
              onChange={e => setFormData({ ...formData, examens_paracliniques: e.target.value })}
              className={`${inputBase} resize-none`} />
          </div>

          {/* Diagnostic */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diagnostic
            </h3>
            <div>
              <Lbl field="diagnostic" htmlFor="diagnostic" req>Diagnostic</Lbl>
              <input id="diagnostic" type="text" required
                title="Diagnostic"
                value={formData.diagnostic || ''}
                placeholder="Ex: Cardiopathie ischemique stable..."
                onChange={e => setFormData({ ...formData, diagnostic: e.target.value })}
                onBlur={() => mark('diagnostic')}
                className={cx('diagnostic')} />
              <FieldErr field="diagnostic" />
            </div>
          </div>

          {/* Traitement */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-3.5 h-3.5" />
              Traitement
            </h3>
            <div>
              <Lbl field="traitement" htmlFor="traitement" req>
                Prescription
              </Lbl>
              <textarea id="traitement" rows={4} required
                title="Traitement"
                value={formData.traitement || ''}
                placeholder="Liste des médicaments, posologie, durée de traitement..."
                onChange={e => setFormData({ ...formData, traitement: e.target.value })}
                onBlur={() => mark('traitement')}
                className={`${cx('traitement')} resize-none`} />
              <FieldErr field="traitement" />
            </div>
          </div>

          {/* Evolution */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Evolution
              <span className="text-gray-400 font-normal normal-case text-[11px]">(optionnel)</span>
            </h3>
            <textarea rows={3}
              value={formData.evolution || ''}
              placeholder="Evolution clinique, pronostic, orientation..."
              onChange={e => setFormData({ ...formData, evolution: e.target.value })}
              className={`${inputBase} resize-none`} />
          </div>

          {/* Suivi */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Suivi
            </h3>
            <div>
              <label htmlFor="prochain_rdv" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Prochain rendez-vous
                <span className="text-gray-400 font-normal ml-1 text-xs">(optionnel)</span>
              </label>
              <input id="prochain_rdv" type="text"
                value={formData.prochain_rdv || ''}
                placeholder="Ex: Consultation de suivi dans 1 mois..."
                onChange={e => setFormData({ ...formData, prochain_rdv: e.target.value })}
                className={inputBase} />
            </div>
          </div>

          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Champs obligatoires</p>
        </form>

        <div className="border-t bg-gray-50 px-5 py-4 flex justify-end items-center gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
            Annuler
          </button>
          <button type="submit" form="add-crc-form" disabled={loading}
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