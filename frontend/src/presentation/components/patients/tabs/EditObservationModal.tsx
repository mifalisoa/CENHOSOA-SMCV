import { useState } from 'react';
import { X, Stethoscope, CheckCircle2, Thermometer, Weight,
         Ruler, HeartPulse, Wind, Droplets, AlertTriangle, PenLine } from 'lucide-react';
import type { Observation, CreateObservationDTO, ObservationSignatures, SignatureSection } from '../../../../core/entities/Observation';
import type { Patient } from '../../../../core/entities/Patient';
import { useAuth } from '../../../hooks/useAuth';

interface EditObservationModalProps {
  patient:     Patient;
  observation: Observation;
  onClose:     () => void;
  onSubmit:    (id: number, data: Partial<CreateObservationDTO>) => Promise<void>;
}

const BASE = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm';
function cxInput(value: unknown, req = false, touched = false): string {
  const filled = value !== undefined && value !== null && String(value).trim() !== '';
  if (req && touched && !filled) return `${BASE} border-red-300 bg-red-50 focus:ring-red-100`;
  if (filled)                    return `${BASE} border-green-300 bg-green-50 focus:ring-green-100`;
  return                                `${BASE} border-gray-300 focus:border-cyan-400 focus:ring-cyan-100`;
}
const BASE_NEUTRAL = `${BASE} border-gray-300 focus:border-cyan-400 focus:ring-cyan-100`;

function getIMCStatus(imc?: number): { label: string; color: string } | null {
  if (!imc) return null;
  if (imc < 18.5) return { label: '⚠️ Maigreur',  color: 'text-red-600'   };
  if (imc < 25)   return { label: '✅ Normal',     color: 'text-green-600' };
  if (imc < 30)   return { label: '⚠️ Surpoids',   color: 'text-red-600'  };
  return             { label: '⚠️ Obésité',    color: 'text-red-600'   };
}

// ── Historique des signatures d'une section ───────────────────────────────────
function SignatureHistory({
  sigs,
  currentUser,
}: {
  sigs?: SignatureSection[];
  currentUser: string;
}) {
  if (!sigs || sigs.length === 0) return null;

  const otherDocs = sigs.filter(s => s.medecin !== currentUser);
  const hasOther  = otherDocs.length > 0;

  return (
    <div className="space-y-1.5 mt-2">
      {/* Avertissement si une autre personne a déjà signé */}
      {hasOther && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Attention</strong> — cette section a été remplie par{' '}
            {otherDocs.map(s => s.medecin).join(', ')}. Votre modification ajoutera votre signature.
          </p>
        </div>
      )}
      {/* Liste de toutes les signatures */}
      {sigs.map((sig, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
          <PenLine className="w-3 h-3 shrink-0" />
          <span>
            <strong className="text-gray-600">{sig.medecin}</strong>
            {sig.role && <span className="text-gray-400 ml-1">({sig.role})</span>}
            {' '}— {new Date(sig.date).toLocaleDateString('fr-FR')} à {sig.heure}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Bannière signature utilisateur connecté ───────────────────────────────────
function NewSignatureBanner({ medecin, role }: { medecin: string; role: string }) {
  if (!medecin) return null;
  const now = new Date();
  return (
    <div className="flex items-center gap-2 text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 mt-2">
      <PenLine className="w-3.5 h-3.5 shrink-0" />
      <span>
        Signé par <strong>{medecin}</strong>
        {role && <span className="text-cyan-500 ml-1">({role})</span>}
        {' '}— {now.toLocaleDateString('fr-FR')} à {now.toTimeString().slice(0, 5)}
      </span>
    </div>
  );
}

// ── En-tête de section ────────────────────────────────────────────────────────
function SectionHeader({ title, filled }: { title: string; filled: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
      {filled && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
    </div>
  );
}

export default function EditObservationModal({ patient, observation, onClose, onSubmit }: EditObservationModalProps) {
  const { user } = useAuth();

  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const currentUserName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim();
  const currentUserRole = user?.role ?? '';

  const [formData, setFormData] = useState<Partial<CreateObservationDTO>>({
    id_patient:                      patient.id_patient,
    type_observation:                observation.type_observation,
    date_observation:                String(observation.date_observation).split('T')[0],
    heure_observation:               String(observation.heure_observation).slice(0, 5),
    medecin:                         observation.medecin || '',
    motif_consultation:              observation.motif_consultation    || '',
    motif_hospitalisation:           observation.motif_hospitalisation || '',
    histoire_maladie:                observation.histoire_maladie      || '',
    date_entree:                     observation.date_entree ? String(observation.date_entree).split('T')[0] : '',
    diagnostic_entree:               observation.diagnostic_entree     || '',
    antecedents_cmo:                 observation.antecedents_cmo       || undefined,
    antecedents_gmo:                 observation.antecedents_gmo       || undefined,
    antecedents_che:                 observation.antecedents_che       || undefined,
    examen_general:                  observation.examen_general        || undefined,
    examen_physique_central:         observation.examen_physique_central      || undefined,
    examen_physique_peripherique:    observation.examen_physique_peripherique || undefined,
    resume_syndromique:              observation.resume_syndromique              || '',
    hypotheses_diagnostiques:        observation.hypotheses_diagnostiques        || '',
    resultats_examens_paracliniques: observation.resultats_examens_paracliniques || '',
    diagnostic_retenu:               observation.diagnostic_retenu     || '',
    cat:                             observation.cat                   || '',
  });

  const existingSigs = (observation.signatures ?? {}) as Record<string, SignatureSection[]>;

  const calculateIMC = (poids?: number, taille?: number): number | undefined => {
    if (!poids || !taille || poids <= 0 || taille <= 0) return undefined;
    const t = taille / 100;
    return Math.round((poids / (t * t)) * 10) / 10;
  };

  // ── Construction signatures — merge existant + nouvelle entrée si modifié ──
  const buildSignatures = (): ObservationSignatures => {
    const now  = new Date();
    const sig: SignatureSection = {
      medecin: currentUserName,
      role:    currentUserRole,
      date:    now.toISOString().split('T')[0],
      heure:   now.toTimeString().slice(0, 5),
    };

    const sigs: Record<string, SignatureSection[]> = { ...existingSigs };

    const appendSig = (key: string) => {
      const existing = sigs[key] ?? [];
      // Éviter un doublon si même user même minute
      const alreadyThisMinute = existing.some(
        s => s.medecin === sig.medecin && s.date === sig.date && s.heure === sig.heure
      );
      if (!alreadyThisMinute) sigs[key] = [...existing, sig];
    };

    const isExt     = formData.type_observation === 'externe';
    const origMotif = isExt ? observation.motif_consultation : observation.motif_hospitalisation;
    const newMotif  = isExt ? formData.motif_consultation    : formData.motif_hospitalisation;

    if (newMotif !== origMotif || formData.histoire_maladie !== observation.histoire_maladie)
      appendSig('motif');
    if (JSON.stringify(formData.antecedents_cmo) !== JSON.stringify(observation.antecedents_cmo) ||
        JSON.stringify(formData.antecedents_gmo) !== JSON.stringify(observation.antecedents_gmo) ||
        JSON.stringify(formData.antecedents_che) !== JSON.stringify(observation.antecedents_che))
      appendSig('antecedents');
    if (JSON.stringify(formData.examen_general) !== JSON.stringify(observation.examen_general))
      appendSig('examen_general');
    if (JSON.stringify(formData.examen_physique_central) !== JSON.stringify(observation.examen_physique_central))
      appendSig('examen_physique_central');
    if (JSON.stringify(formData.examen_physique_peripherique) !== JSON.stringify(observation.examen_physique_peripherique))
      appendSig('examen_physique_peripherique');
    if (formData.resume_syndromique              !== observation.resume_syndromique)              appendSig('resume_syndromique');
    if (formData.hypotheses_diagnostiques        !== observation.hypotheses_diagnostiques)        appendSig('hypotheses_diagnostiques');
    if (formData.resultats_examens_paracliniques !== observation.resultats_examens_paracliniques) appendSig('resultats_examens_paracliniques');
    if (formData.cat               !== observation.cat)               appendSig('cat');
    if (formData.diagnostic_retenu !== observation.diagnostic_retenu) appendSig('diagnostic_retenu');

    return sigs as ObservationSignatures;
  };

  const mark = (...fields: string[]) =>
    setTouchedFields(p => ({ ...p, ...Object.fromEntries(fields.map(f => [f, true])) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medecin?.trim()) {
      mark('medecin');
      setError('Le médecin traitant est requis');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: Partial<CreateObservationDTO> = {
        id_patient:                      formData.id_patient!,
        type_observation:                formData.type_observation!,
        date_observation:                formData.date_observation!,
        heure_observation:               formData.heure_observation!,
        medecin:                         formData.medecin,
        motif_consultation:              formData.motif_consultation      || undefined,
        motif_hospitalisation:           formData.motif_hospitalisation   || undefined,
        histoire_maladie:                formData.histoire_maladie        || undefined,
        date_entree:                     formData.date_entree             || undefined,
        diagnostic_entree:               formData.diagnostic_entree       || undefined,
        antecedents_cmo:                 formData.antecedents_cmo         || undefined,
        antecedents_gmo:                 formData.antecedents_gmo         || undefined,
        antecedents_che:                 formData.antecedents_che         || undefined,
        examen_general:                  formData.examen_general          || undefined,
        examen_physique_central:         formData.examen_physique_central  || undefined,
        examen_physique_peripherique:    formData.examen_physique_peripherique || undefined,
        resume_syndromique:              formData.resume_syndromique       || undefined,
        hypotheses_diagnostiques:        formData.hypotheses_diagnostiques || undefined,
        resultats_examens_paracliniques: formData.resultats_examens_paracliniques || undefined,
        diagnostic_retenu:               formData.diagnostic_retenu       || undefined,
        cat:                             formData.cat                     || undefined,
        signatures:                      buildSignatures(),
      };
      await onSubmit(observation.id_observation, payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const isExt  = formData.type_observation === 'externe';
  const motif  = isExt ? formData.motif_consultation : formData.motif_hospitalisation;
  const imcSt  = getIMCStatus(formData.examen_general?.imc);
  const canSubmit = !!formData.medecin?.trim();

  const filledInfo     = !!(motif || formData.histoire_maladie);
  const filledAnt      = !!(formData.antecedents_cmo || formData.antecedents_gmo || formData.antecedents_che);
  const filledExGen    = !!(formData.examen_general && Object.values(formData.examen_general).some(Boolean));
  const filledExPhys   = !!(formData.examen_physique_central || formData.examen_physique_peripherique);
  const filledSynthese = !!(formData.resume_syndromique || formData.diagnostic_retenu || formData.cat);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">

        {/* Header fixe */}
        <div className="bg-cyan-600 px-5 py-4 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Modifier l'observation médicale
            </h2>
            <p className="text-cyan-100 text-xs mt-0.5">
              {patient.nom_patient} {patient.prenom_patient} —{' '}
              {isExt ? 'Consultation externe' : 'Hospitalisation'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="bg-gray-50 border-b px-5 py-2 flex gap-3 shrink-0 overflow-x-auto">
          {[
            { label: 'Informations',   filled: filledInfo,     sigs: existingSigs['motif']                    },
            { label: 'Antécédents',    filled: filledAnt,      sigs: existingSigs['antecedents']              },
            { label: 'Examen général', filled: filledExGen,    sigs: existingSigs['examen_general']           },
            { label: 'Examen physique',filled: filledExPhys,   sigs: existingSigs['examen_physique_central']  },
            { label: 'Synthèse',       filled: filledSynthese, sigs: existingSigs['diagnostic_retenu']        },
          ].map(({ label, filled, sigs }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <div className={`w-2 h-2 rounded-full ${filled ? 'bg-green-500' : sigs?.length ? 'bg-cyan-400' : 'bg-gray-300'}`} />
              <span className={`text-xs font-medium ${filled ? 'text-green-700' : sigs?.length ? 'text-cyan-700' : 'text-gray-400'}`}>
                {label}
                {sigs?.length ? ` (${sigs.length})` : ''}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Formulaire scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-8">

            {/* ══ SECTION 1 : Informations ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="I. Informations générales" filled={filledInfo} />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-date" className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Date d'observation <span className="text-red-500">*</span>
                    </label>
                    <input id="edit-date" type="date" required
                      value={formData.date_observation || ''}
                      onChange={e => setFormData({ ...formData, date_observation: e.target.value })}
                      className={cxInput(formData.date_observation, true, touchedFields['date_observation'])} />
                  </div>
                  <div>
                    <label htmlFor="edit-heure" className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <input id="edit-heure" type="time" required
                      value={formData.heure_observation || ''}
                      onChange={e => setFormData({ ...formData, heure_observation: e.target.value })}
                      className={cxInput(formData.heure_observation, true, touchedFields['heure_observation'])} />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-motif" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Motif {isExt ? 'de consultation' : "d'hospitalisation"} <span className="text-red-500">*</span>
                  </label>
                  <input id="edit-motif" type="text" required
                    value={motif || ''}
                    placeholder={isExt ? 'Ex: Douleur thoracique...' : "Ex: Insuffisance cardiaque..."}
                    onChange={e => setFormData({ ...formData, [isExt ? 'motif_consultation' : 'motif_hospitalisation']: e.target.value })}
                    className={cxInput(motif, true, touchedFields['motif'])} />
                </div>

                <div>
                  <label htmlFor="edit-histoire" className="block text-xs font-semibold text-gray-600 mb-1.5">Histoire de la maladie</label>
                  <textarea id="edit-histoire" rows={5}
                    value={formData.histoire_maladie || ''}
                    onChange={e => setFormData({ ...formData, histoire_maladie: e.target.value })}
                    className={`${BASE_NEUTRAL} resize-none`} />
                </div>

                {formData.type_observation === 'hospitalise' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-date-entree" className="block text-xs font-semibold text-gray-600 mb-1.5">Date d'entrée</label>
                      <input id="edit-date-entree" type="date"
                        value={formData.date_entree || ''}
                        onChange={e => setFormData({ ...formData, date_entree: e.target.value })}
                        className={BASE_NEUTRAL} />
                    </div>
                    <div>
                      <label htmlFor="edit-diag-entree" className="block text-xs font-semibold text-gray-600 mb-1.5">Diagnostic d'entrée</label>
                      <input id="edit-diag-entree" type="text"
                        value={formData.diagnostic_entree || ''}
                        onChange={e => setFormData({ ...formData, diagnostic_entree: e.target.value })}
                        className={BASE_NEUTRAL} />
                    </div>
                  </div>
                )}

                <SignatureHistory sigs={existingSigs['motif']} currentUser={currentUserName} />
                {filledInfo && <NewSignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 2 : Antécédents ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="II. Antécédents" filled={filledAnt} />
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">CMO</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Chirurgicaux',       key: 'chirurgicaux'        },
                      { label: 'Médicaux',            key: 'medicaux'            },
                      { label: 'Gynéco-obstétricaux', key: 'gyneco_obstetricaux' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label htmlFor={`edit-cmo-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <textarea id={`edit-cmo-${key}`} rows={2} aria-label={label}
                          value={(formData.antecedents_cmo as Record<string, string> | undefined)?.[key] || ''}
                          onChange={e => setFormData({ ...formData, antecedents_cmo: { ...formData.antecedents_cmo, [key]: e.target.value } })}
                          className={`${BASE_NEUTRAL} resize-none`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">GMO</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Génétique',   key: 'genetique' },
                      { label: 'Mode de vie', key: 'mode_vie'  },
                      { label: 'Per Os',      key: 'per_os'    },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label htmlFor={`edit-gmo-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <textarea id={`edit-gmo-${key}`} rows={2} aria-label={label}
                          value={(formData.antecedents_gmo as Record<string, string> | undefined)?.[key] || ''}
                          onChange={e => setFormData({ ...formData, antecedents_gmo: { ...formData.antecedents_gmo, [key]: e.target.value } })}
                          className={`${BASE_NEUTRAL} resize-none`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">CHE</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Curriculum vitae',       key: 'curriculum_vitae',        type: 'textarea' },
                      { label: 'Hospitalisation',         key: 'hospitalisation',          type: 'textarea' },
                      { label: 'Niveau socio-économique', key: 'niveau_socio_economique',  type: 'input'    },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label htmlFor={`edit-che-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        {type === 'textarea' ? (
                          <textarea id={`edit-che-${key}`} rows={2} aria-label={label}
                            value={(formData.antecedents_che as Record<string, string> | undefined)?.[key] || ''}
                            onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, [key]: e.target.value } })}
                            className={`${BASE_NEUTRAL} resize-none`} />
                        ) : (
                          <input id={`edit-che-${key}`} type="text" aria-label={label}
                            value={(formData.antecedents_che as Record<string, string> | undefined)?.[key] || ''}
                            onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, [key]: e.target.value } })}
                            className={BASE_NEUTRAL} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <SignatureHistory sigs={existingSigs['antecedents']} currentUser={currentUserName} />
                {filledAnt && <NewSignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 3 : Examen général ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="III. Examen clinique — Général" filled={filledExGen} />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-etat-gen" className="block text-xs font-semibold text-gray-600 mb-1.5">État général</label>
                    <input id="edit-etat-gen" type="text"
                      value={formData.examen_general?.etat_general || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, etat_general: e.target.value } })}
                      className={cxInput(formData.examen_general?.etat_general)} />
                  </div>
                  <div>
                    <label htmlFor="edit-conscience" className="block text-xs font-semibold text-gray-600 mb-1.5">Conscience</label>
                    <input id="edit-conscience" type="text"
                      value={formData.examen_general?.conscience || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, conscience: e.target.value } })}
                      className={cxInput(formData.examen_general?.conscience)} />
                  </div>
                  <div>
                    <label htmlFor="edit-temp" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />T° (°C)
                    </label>
                    <input id="edit-temp" type="number" step="0.1" aria-label="Température"
                      value={formData.examen_general?.temperature || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, temperature: parseFloat(e.target.value) } })}
                      className={cxInput(formData.examen_general?.temperature)} />
                  </div>
                  <div>
                    <label htmlFor="edit-poids" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5" />Poids (kg)
                    </label>
                    <input id="edit-poids" type="number" step="0.1" aria-label="Poids"
                      value={formData.examen_general?.poids || ''}
                      onChange={e => {
                        const p = parseFloat(e.target.value) || undefined;
                        setFormData({ ...formData, examen_general: { ...formData.examen_general, poids: p, imc: calculateIMC(p, formData.examen_general?.taille) } });
                      }}
                      className={cxInput(formData.examen_general?.poids)} />
                  </div>
                  <div>
                    <label htmlFor="edit-taille" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />Taille (cm)
                    </label>
                    <input id="edit-taille" type="number" aria-label="Taille"
                      value={formData.examen_general?.taille || ''}
                      onChange={e => {
                        const t = parseFloat(e.target.value) || undefined;
                        setFormData({ ...formData, examen_general: { ...formData.examen_general, taille: t, imc: calculateIMC(formData.examen_general?.poids, t) } });
                      }}
                      className={cxInput(formData.examen_general?.taille)} />
                  </div>
                  <div>
                    <label htmlFor="edit-imc" className="block text-xs font-semibold text-gray-600 mb-1.5">IMC (calculé)</label>
                    <input id="edit-imc" type="number" step="0.1" readOnly aria-label="IMC"
                      value={formData.examen_general?.imc || ''} placeholder="Auto"
                      className={`${BASE} border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed text-sm`} />
                    {imcSt && <p className={`text-xs mt-1 font-medium ${imcSt.color}`}>{imcSt.label}</p>}
                  </div>
                  <div>
                    <label htmlFor="edit-fc" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" />FC (bpm)
                    </label>
                    <input id="edit-fc" type="number" aria-label="Fréquence cardiaque"
                      value={formData.examen_general?.frequence_cardiaque || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_cardiaque: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.frequence_cardiaque)} />
                  </div>
                  <div>
                    <label htmlFor="edit-fr" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5" />FR (rpm)
                    </label>
                    <input id="edit-fr" type="number" aria-label="Fréquence respiratoire"
                      value={formData.examen_general?.frequence_respiratoire || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_respiratoire: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.frequence_respiratoire)} />
                  </div>
                  <div>
                    <label htmlFor="edit-spo2" className="block text-xs font-semibold text-gray-600 mb-1.5">SpO2 (%)</label>
                    <input id="edit-spo2" type="number" aria-label="SpO2"
                      value={formData.examen_general?.saturation_oxygene || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, saturation_oxygene: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.saturation_oxygene)} />
                  </div>
                  <div>
                    <label htmlFor="edit-ta-g" className="block text-xs font-semibold text-gray-600 mb-1.5">TA Gauche</label>
                    <input id="edit-ta-g" type="text" placeholder="120/80"
                      value={formData.examen_general?.tension_arterielle_gauche || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_gauche: e.target.value } })}
                      className={cxInput(formData.examen_general?.tension_arterielle_gauche)} />
                  </div>
                  <div>
                    <label htmlFor="edit-ta-d" className="block text-xs font-semibold text-gray-600 mb-1.5">TA Droite</label>
                    <input id="edit-ta-d" type="text" placeholder="120/80"
                      value={formData.examen_general?.tension_arterielle_droite || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_droite: e.target.value } })}
                      className={cxInput(formData.examen_general?.tension_arterielle_droite)} />
                  </div>
                  <div>
                    <label htmlFor="edit-diurese" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" />Diurèse
                    </label>
                    <input id="edit-diurese" type="text"
                      value={formData.examen_general?.diurese || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, diurese: e.target.value } })}
                      className={cxInput(formData.examen_general?.diurese)} />
                  </div>
                  <div>
                    <label htmlFor="edit-tour" className="block text-xs font-semibold text-gray-600 mb-1.5">Tour de taille (cm)</label>
                    <input id="edit-tour" type="number" aria-label="Tour de taille"
                      value={formData.examen_general?.tour_taille || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tour_taille: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.tour_taille)} />
                  </div>
                </div>

                <SignatureHistory sigs={existingSigs['examen_general']} currentUser={currentUserName} />
                {filledExGen && <NewSignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 4 : Examen physique ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="IV. Examen physique" filled={filledExPhys} />
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">Groupe central</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Choc de pointe',        key: 'choc_pointe'           },
                      { label: 'BDC',                   key: 'bdc'                   },
                      { label: 'Souffles',              key: 'souffles'              },
                      { label: 'Pouls périphériques',   key: 'pouls_peripheriques'   },
                      { label: 'Veines jugulaires',     key: 'veines_jugulaires'     },
                      { label: 'Appareil respiratoire', key: 'appareil_respiratoire' },
                      { label: 'Foie',                  key: 'foie'                  },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label htmlFor={`edit-central-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input id={`edit-central-${key}`} type="text" aria-label={label}
                          value={(formData.examen_physique_central as Record<string, string> | undefined)?.[key] || ''}
                          onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, [key]: e.target.value } })}
                          className={cxInput((formData.examen_physique_central as Record<string, string> | undefined)?.[key])} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">Groupe périphérique</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Conjonctives et muqueuses', key: 'conjonctives_muqueuses'  },
                      { label: 'État bucco-dentaire',       key: 'etat_bucco_dentaire'     },
                      { label: 'Masse cervicale',           key: 'masse_cervicale'         },
                      { label: 'Abdomen',                   key: 'abdomen'                 },
                      { label: 'Masse palpée',              key: 'masse_palpee'            },
                      { label: 'Membres inf. (OMI)',        key: 'membres_inferieurs_omi'  },
                      { label: 'Mollets',                   key: 'mollets'                 },
                      { label: 'Extrémités',                key: 'extremites'              },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label htmlFor={`edit-periph-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input id={`edit-periph-${key}`} type="text" aria-label={label}
                          value={(formData.examen_physique_peripherique as Record<string, string> | undefined)?.[key] || ''}
                          onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, [key]: e.target.value } })}
                          className={cxInput((formData.examen_physique_peripherique as Record<string, string> | undefined)?.[key])} />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label htmlFor="edit-autres" className="block text-xs text-gray-500 mb-1">Autres</label>
                      <textarea id="edit-autres" rows={2}
                        value={formData.examen_physique_peripherique?.autres || ''}
                        onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, autres: e.target.value } })}
                        className={`${cxInput(formData.examen_physique_peripherique?.autres)} resize-none`} />
                    </div>
                  </div>
                </div>

                <SignatureHistory sigs={existingSigs['examen_physique_central']} currentUser={currentUserName} />
                {filledExPhys && <NewSignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 5 : Synthèse ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="V. Synthèse et diagnostic" filled={filledSynthese} />
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-resume" className="block text-xs font-semibold text-gray-600 mb-1.5">Résumé syndromique</label>
                  <textarea id="edit-resume" rows={3}
                    value={formData.resume_syndromique || ''}
                    onChange={e => setFormData({ ...formData, resume_syndromique: e.target.value })}
                    className={`${cxInput(formData.resume_syndromique)} resize-none`} />
                  <SignatureHistory sigs={existingSigs['resume_syndromique']} currentUser={currentUserName} />
                </div>
                <div>
                  <label htmlFor="edit-hyp" className="block text-xs font-semibold text-gray-600 mb-1.5">Hypothèses diagnostiques</label>
                  <textarea id="edit-hyp" rows={3}
                    value={formData.hypotheses_diagnostiques || ''}
                    onChange={e => setFormData({ ...formData, hypotheses_diagnostiques: e.target.value })}
                    className={`${cxInput(formData.hypotheses_diagnostiques)} resize-none`} />
                  <SignatureHistory sigs={existingSigs['hypotheses_diagnostiques']} currentUser={currentUserName} />
                </div>
                <div>
                  <label htmlFor="edit-para" className="block text-xs font-semibold text-gray-600 mb-1.5">Résultats examens paracliniques</label>
                  <textarea id="edit-para" rows={3}
                    value={formData.resultats_examens_paracliniques || ''}
                    onChange={e => setFormData({ ...formData, resultats_examens_paracliniques: e.target.value })}
                    className={`${cxInput(formData.resultats_examens_paracliniques)} resize-none`} />
                  <SignatureHistory sigs={existingSigs['resultats_examens_paracliniques']} currentUser={currentUserName} />
                </div>
                <div>
                  <label htmlFor="edit-diag" className="block text-xs font-semibold text-gray-600 mb-1.5">Diagnostic retenu</label>
                  <input id="edit-diag" type="text"
                    value={formData.diagnostic_retenu || ''}
                    placeholder="Ex: Insuffisance cardiaque gauche"
                    onChange={e => setFormData({ ...formData, diagnostic_retenu: e.target.value })}
                    className={cxInput(formData.diagnostic_retenu)} />
                  <SignatureHistory sigs={existingSigs['diagnostic_retenu']} currentUser={currentUserName} />
                </div>
                <div>
                  <label htmlFor="edit-cat" className="block text-xs font-semibold text-gray-600 mb-1.5">CAT</label>
                  <textarea id="edit-cat" rows={3}
                    value={formData.cat || ''}
                    onChange={e => setFormData({ ...formData, cat: e.target.value })}
                    className={`${cxInput(formData.cat)} resize-none`} />
                  <SignatureHistory sigs={existingSigs['cat']} currentUser={currentUserName} />
                </div>
                {filledSynthese && <NewSignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ MÉDECIN TRAITANT ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="Médecin traitant" filled={!!formData.medecin} />
              <div>
                <label htmlFor="edit-medecin" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Médecin traitant <span className="text-red-500">*</span>
                </label>
                <input id="edit-medecin" type="text" required
                  value={formData.medecin || ''}
                  placeholder="Dr. Nom Prénom"
                  onChange={e => setFormData({ ...formData, medecin: e.target.value })}
                  onBlur={() => mark('medecin')}
                  className={cxInput(formData.medecin, true, touchedFields['medecin'])} />
                {touchedFields['medecin'] && !formData.medecin && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />Champ obligatoire
                  </p>
                )}
              </div>
            </div>

          </div>
        </form>

        {/* Footer fixe */}
        <div className="border-t bg-gray-50 px-5 py-3 flex justify-between items-center shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || !canSubmit}
            className={`px-6 py-2 rounded-lg transition-all font-medium shadow-md flex items-center gap-2 text-sm ${
              canSubmit && !loading
                ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}