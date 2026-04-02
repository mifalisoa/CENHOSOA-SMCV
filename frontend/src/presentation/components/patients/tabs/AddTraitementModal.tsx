import { useState, useRef, useEffect } from 'react';
import type { CreateOrdonnanceDTO, MedicamentDTO } from '../../../../core/entities/Traitement';
import type { Patient } from '../../../../core/entities/Patient';
import { X, CheckCircle2, AlertTriangle, Plus, Trash2, Pill, Search } from 'lucide-react';

interface AddTraitementModalProps {
  patient:   Patient;
  onClose:   () => void;
  onSubmit:  (data: CreateOrdonnanceDTO) => Promise<void>;
}

// ── Liste médicaments courants (cardiologie / médecine interne) ───────────────
const MEDICAMENTS_SUGGESTIONS = [
  // Antihypertenseurs
  'Amlodipine', 'Atenolol', 'Bisoprolol', 'Captopril', 'Carvedilol',
  'Enalapril', 'Hydrochlorothiazide', 'Irbesartan', 'Lisinopril',
  'Losartan', 'Metoprolol', 'Nifedipine', 'Ramipril', 'Valsartan',
  // Antiagrégants / anticoagulants
  'Acide acétylsalicylique', 'Aspirine', 'Clopidogrel', 'Héparine',
  'Rivaroxaban', 'Warfarine', 'Dabigatran', 'Apixaban',
  // Statines
  'Atorvastatine', 'Rosuvastatine', 'Simvastatine', 'Pravastatine',
  // Diurétiques
  'Furosémide', 'Spironolactone', 'Indapamide', 'Torasémide',
  // Antidiabétiques
  'Metformine', 'Glibenclamide', 'Insuline', 'Sitagliptine',
  // Antalgiques / anti-inflammatoires
  'Paracétamol', 'Ibuprofène', 'Diclofénac', 'Tramadol', 'Morphine',
  // Antibiotiques
  'Amoxicilline', 'Amoxicilline-Acide clavulanique', 'Azithromycine',
  'Ciprofloxacine', 'Doxycycline', 'Métronidazole', 'Ceftriaxone',
  // Cardio spécifiques
  'Digoxine', 'Amiodarone', 'Diltiazem', 'Vérapamil', 'Nitroglycérine',
  'Isosorbide dinitrate', 'Dobutamine', 'Dopamine', 'Adrénaline',
  // Autres courants
  'Oméprazole', 'Pantoprazole', 'Salbutamol', 'Prednisolone',
  'Dexaméthasone', 'Lévothyroxine', 'Fer sulfate', 'Acide folique',
];

// ── Raccourcis ────────────────────────────────────────────────────────────────
const FREQUENCES = ['1x/j', '2x/j', '3x/j', 'toutes les 6h', 'toutes les 8h', 'toutes les 12h', 'si besoin'];
const DUREES     = ['3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '1 mois', '3 mois', 'à vie'];

// ── Médicament vide ───────────────────────────────────────────────────────────
const emptyMed = (): MedicamentDTO & { _id: number } => ({
  _id:                 Date.now() + Math.random(),
  medicament:          '',
  dosage:              '',
  voie_administration: 'per os',
  frequence:           '',
  duree:               '',
  instructions:        '',
});

// ── Composant suggestion médicament ──────────────────────────────────────────
interface MedAutocompleteProps {
  id:       number;
  value:    string;
  hasError: boolean;
  isOk:     boolean;
  onChange: (val: string) => void;
  onBlur:   () => void;
  allMeds:  string[]; // pour détecter les doublons
}

function MedAutocomplete({ id, value, hasError, isOk, onChange, onBlur, allMeds }: MedAutocompleteProps) {
  const [open,        setOpen]        = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const select = (med: string) => {
    onChange(med);
    setOpen(false);
    onBlur();
  };

  // Détecte si ce médicament est déjà utilisé ailleurs dans l'ordonnance
  const isDuplicate = value.trim() &&
    allMeds.filter(m => m.toLowerCase() === value.toLowerCase()).length > 1;

  const borderClass = hasError || isDuplicate
    ? 'border-red-300 bg-red-50 focus:ring-red-100'
    : isOk
      ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100';

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          id={`medicament_${id}`}
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

      {/* ✅ Avertissement doublon */}
      {isDuplicate && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Ce médicament est déjà présent dans l'ordonnance
        </p>
      )}

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <li key={s}>
              <button type="button"
                onMouseDown={() => select(s)} // mousedown avant blur
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-50 hover:text-cyan-800 transition-colors flex items-center gap-2">
                <Pill className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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

export default function AddTraitementModal({ patient, onClose, onSubmit }: AddTraitementModalProps) {
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});

  const [infos, setInfos] = useState({
    date_prescription:      new Date().toISOString().split('T')[0],
    heure_prescription:     new Date().toTimeString().slice(0, 5),
    type_document:          'ordonnance' as 'ordonnance' | 'traitement',
    diagnostic:             '',
    prescripteur:           '',
    lieu_prescription:      '',
    observations_speciales: '',
  });

  const [meds, setMeds] = useState<(MedicamentDTO & { _id: number })[]>([emptyMed()]);
  const mark = (key: string) => setTouched(p => ({ ...p, [key]: true }));

  // ── Validation ────────────────────────────────────────────────────────────────
  const getMedError = (id: number, field: keyof MedicamentDTO): string | null => {
    if (!touched[`med_${id}_${field}`]) return null;
    const med = meds.find(m => m._id === id);
    if (!med) return null;
    const required: (keyof MedicamentDTO)[] = ['medicament', 'dosage', 'frequence', 'duree'];
    if (required.includes(field) && !String(med[field] || '').trim()) return 'Champ obligatoire';
    return null;
  };

  const isMedValid = (med: MedicamentDTO & { _id: number }) =>
    med.medicament.trim() && med.dosage.trim() && med.frequence.trim() && med.duree.trim();

  // Formulaire valide si tous les médicaments sont valides et pas de doublon
  const allMedNames = meds.map(m => m.medicament.toLowerCase().trim()).filter(Boolean);
  const hasDuplicate = allMedNames.length !== new Set(allMedNames).size;
  const isFormValid  = meds.length > 0 && meds.every(isMedValid) && !hasDuplicate;

  // ── Classes input standard ────────────────────────────────────────────────────
  const cx = (id: number, field: keyof MedicamentDTO) => {
    const err = getMedError(id, field);
    const med = meds.find(m => m._id === id);
    const ok  = touched[`med_${id}_${field}`] && !err && String(med?.[field] || '').trim();
    return `w-full px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
      err ? 'border-red-300 bg-red-50 focus:ring-red-100'
      : ok ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100'
    }`;
  };

  // Label avec icône ✓ / ⚠️
  const Lbl = ({
    id, field, children, req,
  }: { id: number; field: keyof MedicamentDTO; children: React.ReactNode; req?: boolean }) => {
    const err = getMedError(id, field);
    const med = meds.find(m => m._id === id);
    const ok  = touched[`med_${id}_${field}`] && !err && String(med?.[field] || '').trim();
    return (
      <label htmlFor={`${field}_${id}`}
        className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
        <span>{children}{req && <span className="text-red-500 ml-0.5">*</span>}</span>
        {ok  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
        {err && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
      </label>
    );
  };

  const FieldErr = ({ id, field }: { id: number; field: keyof MedicamentDTO }) => {
    const e = getMedError(id, field);
    return e
      ? <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{e}</p>
      : null;
  };

  // ── Actions médicaments ───────────────────────────────────────────────────────
  const addMed    = () => setMeds(prev => [...prev, emptyMed()]);
  const removeMed = (id: number) => { if (meds.length > 1) setMeds(prev => prev.filter(m => m._id !== id)); };
  const updateMed = (id: number, field: keyof MedicamentDTO, value: string) =>
    setMeds(prev => prev.map(m => m._id === id ? { ...m, [field]: value } : m));

  // ── Soumission ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Marque tous les champs obligatoires
    const newTouched: Record<string, boolean> = {};
    meds.forEach(m => ['medicament', 'dosage', 'frequence', 'duree'].forEach(f => {
      newTouched[`med_${m._id}_${f}`] = true;
    }));
    setTouched(prev => ({ ...prev, ...newTouched }));
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const payload: CreateOrdonnanceDTO = {
        id_patient:             patient.id_patient,
        date_prescription:      infos.date_prescription,
        heure_prescription:     infos.heure_prescription,
        type_document:          infos.type_document,
        diagnostic:             infos.diagnostic     || undefined,
        prescripteur:           infos.prescripteur   || undefined,
        lieu_prescription:      infos.lieu_prescription || undefined,
        observations_speciales: infos.observations_speciales || undefined,
        medicaments: meds.map(({ _id, ...med }) => { void _id; return med; }),
      };
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-cyan-400 focus:ring-cyan-100';

  // ── Rendu ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header — cyan */}
        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Nouvelle prescription</h2>
            <p className="text-cyan-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
              {meds.length > 1 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {meds.length} médicaments
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} title="Fermer" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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

        {/* ✅ Avertissement doublon global */}
        {hasDuplicate && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">Un médicament est en doublon dans cette ordonnance.</p>
          </div>
        )}

        <form id="traitement-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Section 1 : Infos prescription ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Informations de la prescription</h3>

            {/* Type */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'ordonnance', emoji: '📋', label: 'Ordonnance' },
                { value: 'traitement', emoji: '💊', label: 'Traitement' },
              ].map(({ value, emoji, label }) => (
                <button key={value} type="button"
                  onClick={() => setInfos({ ...infos, type_document: value as 'ordonnance' | 'traitement' })}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    infos.type_document === value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-sm font-semibold">{label}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date_prescription" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="date_prescription" type="date" required title="Date de prescription"
                  value={infos.date_prescription}
                  onChange={e => setInfos({ ...infos, date_prescription: e.target.value })}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="heure_prescription" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Heure<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input id="heure_prescription" type="time" required title="Heure de prescription"
                  value={infos.heure_prescription}
                  onChange={e => setInfos({ ...infos, heure_prescription: e.target.value })}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="prescripteur" className="text-sm font-medium text-gray-700 mb-1.5 block">Prescripteur</label>
                <input id="prescripteur" type="text" placeholder="Dr. Nom Prénom"
                  value={infos.prescripteur}
                  onChange={e => setInfos({ ...infos, prescripteur: e.target.value })}
                  className={inputBase} />
              </div>
              <div>
                <label htmlFor="lieu_prescription" className="text-sm font-medium text-gray-700 mb-1.5 block">Lieu</label>
                <input id="lieu_prescription" type="text" placeholder="Hôpital, Cabinet..."
                  value={infos.lieu_prescription}
                  onChange={e => setInfos({ ...infos, lieu_prescription: e.target.value })}
                  className={inputBase} />
              </div>
              <div className="col-span-2">
                <label htmlFor="diagnostic" className="text-sm font-medium text-gray-700 mb-1.5 block">Diagnostic</label>
                <input id="diagnostic" type="text" placeholder="Ex: HTA, Diabète type 2..."
                  value={infos.diagnostic}
                  onChange={e => setInfos({ ...infos, diagnostic: e.target.value })}
                  className={inputBase} />
              </div>
              <div className="col-span-2">
                <label htmlFor="observations_speciales" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Observations spéciales
                </label>
                <textarea id="observations_speciales" rows={2}
                  title="Observations spéciales ou précautions"
                  placeholder="Précautions, contre-indications..."
                  value={infos.observations_speciales}
                  onChange={e => setInfos({ ...infos, observations_speciales: e.target.value })}
                  className={`${inputBase} resize-none`} />
              </div>
            </div>
          </div>

          {/* ── Section 2 : Médicaments ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Médicaments
                <span className="ml-2 bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {meds.length}
                </span>
              </h3>
              <button type="button" onClick={addMed}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95">
                <Plus className="w-3.5 h-3.5" />
                Ajouter un médicament
              </button>
            </div>

            {meds.map((med, index) => {
              const medErr = getMedError(med._id, 'medicament');
              const medOk  = touched[`med_${med._id}_medicament`] && !medErr && med.medicament.trim();
              return (
                <div key={med._id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">

                  {/* En-tête carte médicament */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-cyan-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Médicament {index + 1}
                        {med.medicament && <span className="text-gray-500 font-normal ml-1">— {med.medicament}</span>}
                      </span>
                      {isMedValid(med) && !hasDuplicate && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    {meds.length > 1 && (
                      <button type="button" onClick={() => removeMed(med._id)}
                        title="Supprimer ce médicament"
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    {/* ── Nom du médicament avec autocomplétion ── */}
                    <div className="col-span-2">
                      <label htmlFor={`medicament_${med._id}`}
                        className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                        <span>Nom du médicament<span className="text-red-500 ml-0.5">*</span></span>
                        {medOk  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                        {medErr && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      </label>
                      {/* ✅ Autocomplétion */}
                      <MedAutocomplete
                        id={med._id}
                        value={med.medicament}
                        hasError={!!medErr}
                        isOk={!!medOk}
                        onChange={v => updateMed(med._id, 'medicament', v)}
                        onBlur={() => mark(`med_${med._id}_medicament`)}
                        allMeds={meds.map(m => m.medicament)}
                      />
                      {medErr && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />{medErr}
                        </p>
                      )}
                    </div>

                    {/* ── Dosage ── */}
                    <div>
                      <Lbl id={med._id} field="dosage" req>Dosage</Lbl>
                      <input id={`dosage_${med._id}`} type="text" title="Dosage"
                        value={med.dosage} placeholder="Ex: 500mg, 1g..."
                        onChange={e => updateMed(med._id, 'dosage', e.target.value)}
                        onBlur={() => mark(`med_${med._id}_dosage`)}
                        className={cx(med._id, 'dosage')} />
                      <FieldErr id={med._id} field="dosage" />
                    </div>

                    {/* ── Voie d'administration ── */}
                    <div>
                      <label htmlFor={`voie_${med._id}`}
                        className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Voie d'administration
                      </label>
                      <select id={`voie_${med._id}`} title="Voie d'administration"
                        value={med.voie_administration}
                        onChange={e => updateMed(med._id, 'voie_administration', e.target.value)}
                        className={cx(med._id, 'voie_administration')}>
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

                    {/* ── Fréquence avec raccourcis ── */}
                    <div>
                      <Lbl id={med._id} field="frequence" req>Fréquence</Lbl>
                      <input id={`frequence_${med._id}`} type="text" title="Fréquence de prise"
                        value={med.frequence} placeholder="Ex: 3x/jour..."
                        onChange={e => updateMed(med._id, 'frequence', e.target.value)}
                        onBlur={() => mark(`med_${med._id}_frequence`)}
                        className={cx(med._id, 'frequence')} />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {FREQUENCES.map(f => (
                          <button key={f} type="button"
                            onClick={() => { updateMed(med._id, 'frequence', f); mark(`med_${med._id}_frequence`); }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                              med.frequence === f
                                ? 'bg-cyan-600 text-white border-cyan-600'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-cyan-300 hover:text-cyan-700'
                            }`}>{f}</button>
                        ))}
                      </div>
                      <FieldErr id={med._id} field="frequence" />
                    </div>

                    {/* ── Durée avec raccourcis ── */}
                    <div>
                      <Lbl id={med._id} field="duree" req>Durée</Lbl>
                      <input id={`duree_${med._id}`} type="text" title="Durée du traitement"
                        value={med.duree} placeholder="Ex: 7 jours..."
                        onChange={e => updateMed(med._id, 'duree', e.target.value)}
                        onBlur={() => mark(`med_${med._id}_duree`)}
                        className={cx(med._id, 'duree')} />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {DUREES.map(d => (
                          <button key={d} type="button"
                            onClick={() => { updateMed(med._id, 'duree', d); mark(`med_${med._id}_duree`); }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                              med.duree === d
                                ? 'bg-cyan-600 text-white border-cyan-600'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-cyan-300 hover:text-cyan-700'
                            }`}>{d}</button>
                        ))}
                      </div>
                      <FieldErr id={med._id} field="duree" />
                    </div>

                    {/* ── Instructions ── */}
                    <div className="col-span-2">
                      <label htmlFor={`instructions_${med._id}`}
                        className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Instructions spécifiques
                      </label>
                      <textarea id={`instructions_${med._id}`} rows={2}
                        title="Instructions spécifiques pour ce médicament"
                        value={med.instructions || ''}
                        placeholder="Ex: Prendre pendant les repas, éviter le soleil..."
                        onChange={e => updateMed(med._id, 'instructions', e.target.value)}
                        className={`${inputBase} resize-none`} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bouton ajouter en bas si plusieurs médicaments */}
            {meds.length >= 2 && (
              <button type="button" onClick={addMed}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-cyan-400 hover:text-cyan-600 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un autre médicament
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Champs obligatoires</p>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-5 py-4 flex justify-between items-center shrink-0">
          <p className="text-xs text-gray-500">
            {meds.length} médicament{meds.length > 1 ? 's' : ''} dans cette prescription
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
              Annuler
            </button>
            {/* ✅ Grisé si formulaire invalide ou doublon */}
            <button type="submit" form="traitement-form" disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                isFormValid && !loading
                  ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                : <><CheckCircle2 className="w-4 h-4" />Enregistrer ({meds.length} médicament{meds.length > 1 ? 's' : ''})</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}