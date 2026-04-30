import { useState, useRef, useEffect } from 'react';
import type { Traitement, CreateTraitementDTO } from '../../../../core/entities/Traitement';
import type { Patient } from '../../../../core/entities/Patient';
import { X, CheckCircle2, AlertTriangle, Pill, Search } from 'lucide-react';

interface EditTraitementModalProps {
  patient:  Patient;
  traitement: Traitement;
  onClose:  () => void;
  onSubmit: (id: number, data: Partial<CreateTraitementDTO>) => Promise<void>;
}

const MEDICAMENTS_SUGGESTIONS = [
  'Amlodipine', 'Atenolol', 'Bisoprolol', 'Captopril', 'Carvedilol',
  'Enalapril', 'Hydrochlorothiazide', 'Irbesartan', 'Lisinopril',
  'Losartan', 'Metoprolol', 'Nifedipine', 'Ramipril', 'Valsartan',
  'Acide acétylsalicylique', 'Aspirine', 'Clopidogrel', 'Héparine',
  'Rivaroxaban', 'Warfarine', 'Dabigatran', 'Apixaban',
  'Atorvastatine', 'Rosuvastatine', 'Simvastatine', 'Pravastatine',
  'Furosémide', 'Spironolactone', 'Indapamide', 'Torasémide',
  'Metformine', 'Glibenclamide', 'Insuline', 'Sitagliptine',
  'Paracétamol', 'Ibuprofène', 'Diclofénac', 'Tramadol', 'Morphine',
  'Amoxicilline', 'Amoxicilline-Acide clavulanique', 'Azithromycine',
  'Ciprofloxacine', 'Doxycycline', 'Métronidazole', 'Ceftriaxone',
  'Digoxine', 'Amiodarone', 'Diltiazem', 'Vérapamil', 'Nitroglycérine',
  'Isosorbide dinitrate', 'Dobutamine', 'Dopamine', 'Adrénaline',
  'Oméprazole', 'Pantoprazole', 'Salbutamol', 'Prednisolone',
  'Dexaméthasone', 'Lévothyroxine', 'Fer sulfate', 'Acide folique',
];

const FREQUENCES = ['1x/j', '2x/j', '3x/j', 'toutes les 6h', 'toutes les 8h', 'toutes les 12h', 'si besoin'];
const DUREES     = ['3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '1 mois', '3 mois', 'à vie'];

// ── Autocomplete (réutilisé depuis Add, focus ring orange) ───────────────────
interface MedAutocompleteProps {
  value:    string;
  hasError: boolean;
  isOk:     boolean;
  onChange: (val: string) => void;
  onBlur:   () => void;
}

function MedAutocomplete({ value, hasError, isOk, onChange, onBlur }: MedAutocompleteProps) {
  const [open,        setOpen]        = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (val.length >= 2) {
      const filtered = MEDICAMENTS_SUGGESTIONS.filter(m =>
        m.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setOpen(false);
    }
  };

  const borderClass = hasError
    ? 'border-red-300 bg-red-50 focus:ring-red-100'
    : isOk
      ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100';

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          id="edit-medicament"
          type="text"
          title="Nom du médicament"
          value={value}
          placeholder="Ex: Paracétamol, Amoxicilline..."
          onChange={e => handleChange(e.target.value)}
          onBlur={() => { setOpen(false); onBlur(); }}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
          className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${borderClass}`}
          autoComplete="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <li key={s}>
              <button type="button"
                onMouseDown={() => { onChange(s); setOpen(false); onBlur(); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-800 transition-colors flex items-center gap-2">
                <Pill className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const REQUIRED: (keyof CreateTraitementDTO)[] = ['medicament', 'dosage', 'frequence', 'duree'];

export default function EditTraitementModal({ patient, traitement, onClose, onSubmit }: EditTraitementModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateTraitementDTO>>({
    medicament:          traitement.medicament,
    dosage:              traitement.dosage,
    voie_administration: traitement.voie_administration || 'per os',
    frequence:           traitement.frequence,
    duree:               traitement.duree,
    instructions:        traitement.instructions || '',
    date_prescription:   String(traitement.date_prescription).split('T')[0],
    heure_prescription:  traitement.heure_prescription,
    prescripteur:        traitement.prescripteur || '',
    diagnostic:          traitement.diagnostic || '',
    lieu_prescription:   traitement.lieu_prescription || '',
    observations_speciales: traitement.observations_speciales || '',
  });

  const mark = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  const getError = (field: keyof CreateTraitementDTO): string | null => {
    if (!touched[field]) return null;
    if (REQUIRED.includes(field)) {
      const val = formData[field];
      if (!val || String(val).trim() === '') return 'Champ obligatoire';
    }
    return null;
  };

  const isFormValid = REQUIRED.every(f => {
    const val = formData[f];
    return val && String(val).trim() !== '';
  });

  const cx = (field: keyof CreateTraitementDTO) => {
    const err = getError(field);
    const val = formData[field];
    const ok  = touched[field] && !err && val && String(val).trim();
    return `w-full px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
      err ? 'border-red-300 bg-red-50 focus:ring-red-100'
      : ok ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
    }`;
  };

  const Lbl = ({ field, children, req }: {
    field: keyof CreateTraitementDTO; children: React.ReactNode; req?: boolean;
  }) => {
    const err = getError(field);
    const val = formData[field];
    const ok  = touched[field] && !err && val && String(val).trim();
    return (
      <label htmlFor={`edit-${field}`}
        className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
        <span>{children}{req && <span className="text-red-500 ml-0.5">*</span>}</span>
        {ok  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
        {err && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
      </label>
    );
  };

  const FieldErr = ({ field }: { field: keyof CreateTraitementDTO }) => {
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
      await onSubmit(traitement.id_traitement, formData);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100';

  const medErr = getError('medicament');
  const medOk  = touched['medicament'] && !medErr && formData.medicament?.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header orange */}
        <div className="bg-orange-500 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Pill className="w-5 h-5 shrink-0" />
              Modifier le médicament
            </h2>
            <p className="text-orange-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {traitement.medicament}
              </span>
            </p>
          </div>
          <button onClick={onClose} title="Fermer" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <form id="edit-traitement-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Section 1 — Médicament */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-3.5 h-3.5" />
              Médicament
            </h3>

            {/* Nom avec autocomplete */}
            <div>
              <label htmlFor="edit-medicament"
                className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                <span>Nom du médicament<span className="text-red-500 ml-0.5">*</span></span>
                {medOk  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                {medErr && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
              </label>
              <MedAutocomplete
                value={formData.medicament || ''}
                hasError={!!medErr}
                isOk={!!medOk}
                onChange={v => setFormData(p => ({ ...p, medicament: v }))}
                onBlur={() => mark('medicament')}
              />
              {medErr && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />{medErr}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl field="dosage" req>Dosage</Lbl>
                <input id="edit-dosage" type="text" title="Dosage"
                  value={formData.dosage || ''} placeholder="Ex: 500mg, 1g..."
                  onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))}
                  onBlur={() => mark('dosage')}
                  className={cx('dosage')} />
                <FieldErr field="dosage" />
              </div>

              <div>
                <label htmlFor="edit-voie" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Voie d'administration
                </label>
                <select id="edit-voie" title="Voie d'administration"
                  value={formData.voie_administration || 'per os'}
                  onChange={e => setFormData(p => ({ ...p, voie_administration: e.target.value }))}
                  className={cx('voie_administration')}>
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

              <div>
                <Lbl field="frequence" req>Fréquence</Lbl>
                <input id="edit-frequence" type="text" title="Fréquence de prise"
                  value={formData.frequence || ''} placeholder="Ex: 3x/jour..."
                  onChange={e => setFormData(p => ({ ...p, frequence: e.target.value }))}
                  onBlur={() => mark('frequence')}
                  className={cx('frequence')} />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {FREQUENCES.map(f => (
                    <button key={f} type="button"
                      onClick={() => { setFormData(p => ({ ...p, frequence: f })); mark('frequence'); }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                        formData.frequence === f
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                      }`}>{f}</button>
                  ))}
                </div>
                <FieldErr field="frequence" />
              </div>

              <div>
                <Lbl field="duree" req>Durée</Lbl>
                <input id="edit-duree" type="text" title="Durée du traitement"
                  value={formData.duree || ''} placeholder="Ex: 7 jours..."
                  onChange={e => setFormData(p => ({ ...p, duree: e.target.value }))}
                  onBlur={() => mark('duree')}
                  className={cx('duree')} />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {DUREES.map(d => (
                    <button key={d} type="button"
                      onClick={() => { setFormData(p => ({ ...p, duree: d })); mark('duree'); }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                        formData.duree === d
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                      }`}>{d}</button>
                  ))}
                </div>
                <FieldErr field="duree" />
              </div>

              <div className="col-span-2">
                <label htmlFor="edit-instructions" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Instructions spécifiques
                </label>
                <textarea id="edit-instructions" rows={2}
                  title="Instructions spécifiques pour ce médicament"
                  value={formData.instructions || ''}
                  placeholder="Ex: Prendre pendant les repas, éviter le soleil..."
                  onChange={e => setFormData(p => ({ ...p, instructions: e.target.value }))}
                  className={`${inputBase} resize-none`} />
              </div>
            </div>
          </div>

          {/* Section 2 — Infos prescription (modifiables mais secondaires) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Informations de la prescription</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-date" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="edit-date" type="date" required
                  value={formData.date_prescription || ''}
                  onChange={e => setFormData(p => ({ ...p, date_prescription: e.target.value }))}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="edit-heure" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Heure<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="edit-heure" type="time" required
                  value={formData.heure_prescription || ''}
                  onChange={e => setFormData(p => ({ ...p, heure_prescription: e.target.value }))}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="edit-prescripteur" className="text-sm font-medium text-gray-700 mb-1.5 block">Prescripteur</label>
                <input id="edit-prescripteur" type="text" placeholder="Dr. Nom Prénom"
                  value={formData.prescripteur || ''}
                  onChange={e => setFormData(p => ({ ...p, prescripteur: e.target.value }))}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="edit-lieu" className="text-sm font-medium text-gray-700 mb-1.5 block">Lieu</label>
                <input id="edit-lieu" type="text" placeholder="Hôpital, Cabinet..."
                  value={formData.lieu_prescription || ''}
                  onChange={e => setFormData(p => ({ ...p, lieu_prescription: e.target.value }))}
                  className={inputBase} />
              </div>
              <div className="col-span-2">
                <label htmlFor="edit-diagnostic" className="text-sm font-medium text-gray-700 mb-1.5 block">Diagnostic</label>
                <input id="edit-diagnostic" type="text" placeholder="Ex: HTA, Diabète type 2..."
                  value={formData.diagnostic || ''}
                  onChange={e => setFormData(p => ({ ...p, diagnostic: e.target.value }))}
                  className={inputBase} />
              </div>
              <div className="col-span-2">
                <label htmlFor="edit-obs" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Observations spéciales
                </label>
                <textarea id="edit-obs" rows={2}
                  value={formData.observations_speciales || ''}
                  placeholder="Précautions, contre-indications..."
                  onChange={e => setFormData(p => ({ ...p, observations_speciales: e.target.value }))}
                  className={`${inputBase} resize-none`} />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Champs obligatoires</p>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-5 py-4 flex justify-end items-center gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
            Annuler
          </button>
          <button type="submit" form="edit-traitement-form" disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isFormValid && !loading
                ? 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer les modifications</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}