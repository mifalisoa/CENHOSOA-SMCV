import { useState } from 'react';
import { X, Stethoscope, CheckCircle2, Thermometer, Weight,
         Ruler, HeartPulse, Wind, Droplets, AlertTriangle, PenLine } from 'lucide-react';
import type { CreateObservationDTO, ObservationSignatures, SignatureSection } from '../../../../core/entities/Observation';
import type { Patient } from '../../../../core/entities/Patient';
import { useAuth } from '../../../hooks/useAuth';

interface AddObservationModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateObservationDTO) => Promise<void>;
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

// ── Bannière signature du médecin connecté ────────────────────────────────────
function SignatureBanner({ medecin, role }: { medecin: string; role: string }) {
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

export default function AddObservationModal({ patient, onClose, onSubmit }: AddObservationModalProps) {
  const { user } = useAuth();
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const currentUserName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim();
  const currentUserRole = user?.role ?? '';

  const [formData, setFormData] = useState<Partial<CreateObservationDTO>>({
    id_patient:        patient.id_patient,
    type_observation:  patient.statut_patient === 'externe' ? 'externe' : 'hospitalise',
    date_observation:  new Date().toISOString().split('T')[0],
    heure_observation: new Date().toTimeString().slice(0, 5),
    medecin:           currentUserName,
  });

  const calculateIMC = (poids?: number, taille?: number): number | undefined => {
    if (!poids || !taille || poids <= 0 || taille <= 0) return undefined;
    const t = taille / 100;
    return Math.round((poids / (t * t)) * 10) / 10;
  };

  // ── Construction des signatures ───────────────────────────────────────────
  const buildSignatures = (): ObservationSignatures => {
    const now    = new Date();
    const sig: SignatureSection = {
      medecin: currentUserName,
      role:    currentUserRole,
      date:    now.toISOString().split('T')[0],
      heure:   now.toTimeString().slice(0, 5),
    };
    const sigs: ObservationSignatures = {};
    const isExt = formData.type_observation === 'externe';

    if ((isExt ? formData.motif_consultation : formData.motif_hospitalisation) || formData.histoire_maladie)
      sigs.motif = [sig];
    if (formData.antecedents_cmo || formData.antecedents_gmo || formData.antecedents_che)
      sigs.antecedents = [sig];
    if (formData.examen_general && Object.values(formData.examen_general).some(v => v !== undefined && v !== ''))
      sigs.examen_general = [sig];
    if (formData.examen_physique_central && Object.values(formData.examen_physique_central).some(Boolean))
      sigs.examen_physique_central = [sig];
    if (formData.examen_physique_peripherique && Object.values(formData.examen_physique_peripherique).some(Boolean))
      sigs.examen_physique_peripherique = [sig];
    if (formData.resume_syndromique)              sigs.resume_syndromique = [sig];
    if (formData.hypotheses_diagnostiques)        sigs.hypotheses_diagnostiques = [sig];
    if (formData.resultats_examens_paracliniques) sigs.resultats_examens_paracliniques = [sig];
    if (formData.cat)                             sigs.cat = [sig];
    if (formData.diagnostic_retenu)               sigs.diagnostic_retenu = [sig];
    return sigs;
  };

  const mark = (...fields: string[]) =>
    setTouchedFields(p => ({ ...p, ...Object.fromEntries(fields.map(f => [f, true])) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isExt = formData.type_observation === 'externe';
    const motif = isExt ? formData.motif_consultation : formData.motif_hospitalisation;
    if (!motif?.trim()) {
      mark('motif');
      setError('Le motif est requis');
      return;
    }
    if (!formData.medecin?.trim()) {
      mark('medecin');
      setError('Le médecin traitant est requis');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: CreateObservationDTO = {
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
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const isExt  = formData.type_observation === 'externe';
  const motif  = isExt ? formData.motif_consultation : formData.motif_hospitalisation;
  const imcSt  = getIMCStatus(formData.examen_general?.imc);
  const canSubmit = !!motif?.trim() && !!formData.medecin?.trim();

  // Indicateurs de remplissage par section
  const filledInfo      = !!(motif || formData.histoire_maladie);
  const filledAnt       = !!(formData.antecedents_cmo || formData.antecedents_gmo || formData.antecedents_che);
  const filledExGen     = !!(formData.examen_general && Object.values(formData.examen_general).some(Boolean));
  const filledExPhys    = !!(formData.examen_physique_central || formData.examen_physique_peripherique);
  const filledSynthese  = !!(formData.resume_syndromique || formData.diagnostic_retenu || formData.cat);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">

        {/* Header fixe */}
        <div className="bg-cyan-600 px-5 py-4 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Nouvelle observation médicale
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

        {/* Barre de progression visuelle */}
        <div className="bg-gray-50 border-b px-5 py-2 flex gap-3 shrink-0 overflow-x-auto">
          {[
            { label: 'Informations',   filled: filledInfo     },
            { label: 'Antécédents',    filled: filledAnt      },
            { label: 'Examen général', filled: filledExGen    },
            { label: 'Examen physique',filled: filledExPhys   },
            { label: 'Synthèse',       filled: filledSynthese },
          ].map(({ label, filled }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <div className={`w-2 h-2 rounded-full ${filled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`text-xs font-medium ${filled ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
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
                    <label htmlFor="add-date" className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Date d'observation <span className="text-red-500">*</span>
                    </label>
                    <input id="add-date" type="date" required
                      value={formData.date_observation || ''}
                      onChange={e => setFormData({ ...formData, date_observation: e.target.value })}
                      className={cxInput(formData.date_observation, true, touchedFields['date_observation'])} />
                  </div>
                  <div>
                    <label htmlFor="add-heure" className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <input id="add-heure" type="time" required
                      value={formData.heure_observation || ''}
                      onChange={e => setFormData({ ...formData, heure_observation: e.target.value })}
                      className={cxInput(formData.heure_observation, true, touchedFields['heure_observation'])} />
                  </div>
                </div>

                <div>
                  <label htmlFor="add-motif" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Motif {isExt ? 'de consultation' : "d'hospitalisation"} <span className="text-red-500">*</span>
                  </label>
                  <input id="add-motif" type="text" required
                    value={motif || ''}
                    placeholder={isExt ? 'Ex: Douleur thoracique...' : "Ex: Insuffisance cardiaque..."}
                    onChange={e => setFormData({ ...formData, [isExt ? 'motif_consultation' : 'motif_hospitalisation']: e.target.value })}
                    className={cxInput(motif, true, touchedFields['motif'])} />
                </div>

                <div>
                  <label htmlFor="add-histoire" className="block text-xs font-semibold text-gray-600 mb-1.5">Histoire de la maladie</label>
                  <textarea id="add-histoire" rows={5}
                    value={formData.histoire_maladie || ''}
                    onChange={e => setFormData({ ...formData, histoire_maladie: e.target.value })}
                    placeholder="Décrivez l'évolution de la maladie..."
                    className={`${BASE_NEUTRAL} resize-none`} />
                </div>

                {formData.type_observation === 'hospitalise' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="add-date-entree" className="block text-xs font-semibold text-gray-600 mb-1.5">Date d'entrée</label>
                      <input id="add-date-entree" type="date"
                        value={formData.date_entree || ''}
                        onChange={e => setFormData({ ...formData, date_entree: e.target.value })}
                        className={BASE_NEUTRAL} />
                    </div>
                    <div>
                      <label htmlFor="add-diag-entree" className="block text-xs font-semibold text-gray-600 mb-1.5">Diagnostic d'entrée</label>
                      <input id="add-diag-entree" type="text"
                        value={formData.diagnostic_entree || ''}
                        onChange={e => setFormData({ ...formData, diagnostic_entree: e.target.value })}
                        className={BASE_NEUTRAL} />
                    </div>
                  </div>
                )}

                {filledInfo && <SignatureBanner medecin={currentUserName} role={currentUserRole} />}
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
                        <label htmlFor={`add-cmo-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <textarea id={`add-cmo-${key}`} rows={2} aria-label={label}
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
                        <label htmlFor={`add-gmo-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <textarea id={`add-gmo-${key}`} rows={2} aria-label={label}
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
                        <label htmlFor={`add-che-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        {type === 'textarea' ? (
                          <textarea id={`add-che-${key}`} rows={2} aria-label={label}
                            value={(formData.antecedents_che as Record<string, string> | undefined)?.[key] || ''}
                            onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, [key]: e.target.value } })}
                            className={`${BASE_NEUTRAL} resize-none`} />
                        ) : (
                          <input id={`add-che-${key}`} type="text" aria-label={label}
                            value={(formData.antecedents_che as Record<string, string> | undefined)?.[key] || ''}
                            onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, [key]: e.target.value } })}
                            className={BASE_NEUTRAL} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {filledAnt && <SignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 3 : Examen général ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="III. Examen clinique — Général" filled={filledExGen} />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="add-etat-gen" className="block text-xs font-semibold text-gray-600 mb-1.5">État général</label>
                    <input id="add-etat-gen" type="text"
                      value={formData.examen_general?.etat_general || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, etat_general: e.target.value } })}
                      className={cxInput(formData.examen_general?.etat_general)} />
                  </div>
                  <div>
                    <label htmlFor="add-conscience" className="block text-xs font-semibold text-gray-600 mb-1.5">Conscience</label>
                    <input id="add-conscience" type="text"
                      value={formData.examen_general?.conscience || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, conscience: e.target.value } })}
                      className={cxInput(formData.examen_general?.conscience)} />
                  </div>
                  <div>
                    <label htmlFor="add-temp" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />T° (°C)
                    </label>
                    <input id="add-temp" type="number" step="0.1" aria-label="Température"
                      value={formData.examen_general?.temperature || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, temperature: parseFloat(e.target.value) } })}
                      className={cxInput(formData.examen_general?.temperature)} />
                  </div>
                  <div>
                    <label htmlFor="add-poids" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5" />Poids (kg)
                    </label>
                    <input id="add-poids" type="number" step="0.1" aria-label="Poids"
                      value={formData.examen_general?.poids || ''}
                      onChange={e => {
                        const p = parseFloat(e.target.value) || undefined;
                        setFormData({ ...formData, examen_general: { ...formData.examen_general, poids: p, imc: calculateIMC(p, formData.examen_general?.taille) } });
                      }}
                      className={cxInput(formData.examen_general?.poids)} />
                  </div>
                  <div>
                    <label htmlFor="add-taille" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />Taille (cm)
                    </label>
                    <input id="add-taille" type="number" aria-label="Taille"
                      value={formData.examen_general?.taille || ''}
                      onChange={e => {
                        const t = parseFloat(e.target.value) || undefined;
                        setFormData({ ...formData, examen_general: { ...formData.examen_general, taille: t, imc: calculateIMC(formData.examen_general?.poids, t) } });
                      }}
                      className={cxInput(formData.examen_general?.taille)} />
                  </div>
                  <div>
                    <label htmlFor="add-imc" className="block text-xs font-semibold text-gray-600 mb-1.5">IMC (calculé)</label>
                    <input id="add-imc" type="number" step="0.1" readOnly aria-label="IMC"
                      value={formData.examen_general?.imc || ''} placeholder="Auto"
                      className={`${BASE} border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed text-sm`} />
                    {imcSt && <p className={`text-xs mt-1 font-medium ${imcSt.color}`}>{imcSt.label}</p>}
                  </div>
                  <div>
                    <label htmlFor="add-fc" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" />FC (bpm)
                    </label>
                    <input id="add-fc" type="number" aria-label="Fréquence cardiaque"
                      value={formData.examen_general?.frequence_cardiaque || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_cardiaque: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.frequence_cardiaque)} />
                  </div>
                  <div>
                    <label htmlFor="add-fr" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5" />FR (rpm)
                    </label>
                    <input id="add-fr" type="number" aria-label="Fréquence respiratoire"
                      value={formData.examen_general?.frequence_respiratoire || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_respiratoire: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.frequence_respiratoire)} />
                  </div>
                  <div>
                    <label htmlFor="add-spo2" className="block text-xs font-semibold text-gray-600 mb-1.5">SpO2 (%)</label>
                    <input id="add-spo2" type="number" aria-label="SpO2"
                      value={formData.examen_general?.saturation_oxygene || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, saturation_oxygene: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.saturation_oxygene)} />
                  </div>
                  <div>
                    <label htmlFor="add-ta-g" className="block text-xs font-semibold text-gray-600 mb-1.5">TA Gauche</label>
                    <input id="add-ta-g" type="text" placeholder="120/80"
                      value={formData.examen_general?.tension_arterielle_gauche || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_gauche: e.target.value } })}
                      className={cxInput(formData.examen_general?.tension_arterielle_gauche)} />
                  </div>
                  <div>
                    <label htmlFor="add-ta-d" className="block text-xs font-semibold text-gray-600 mb-1.5">TA Droite</label>
                    <input id="add-ta-d" type="text" placeholder="120/80"
                      value={formData.examen_general?.tension_arterielle_droite || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_droite: e.target.value } })}
                      className={cxInput(formData.examen_general?.tension_arterielle_droite)} />
                  </div>
                  <div>
                    <label htmlFor="add-diurese" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" />Diurèse
                    </label>
                    <input id="add-diurese" type="text"
                      value={formData.examen_general?.diurese || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, diurese: e.target.value } })}
                      className={cxInput(formData.examen_general?.diurese)} />
                  </div>
                  <div>
                    <label htmlFor="add-tour" className="block text-xs font-semibold text-gray-600 mb-1.5">Tour de taille (cm)</label>
                    <input id="add-tour" type="number" aria-label="Tour de taille"
                      value={formData.examen_general?.tour_taille || ''}
                      onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tour_taille: parseInt(e.target.value) } })}
                      className={cxInput(formData.examen_general?.tour_taille)} />
                  </div>
                </div>
                {filledExGen && <SignatureBanner medecin={currentUserName} role={currentUserRole} />}
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
                        <label htmlFor={`add-central-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input id={`add-central-${key}`} type="text" aria-label={label}
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
                        <label htmlFor={`add-periph-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input id={`add-periph-${key}`} type="text" aria-label={label}
                          value={(formData.examen_physique_peripherique as Record<string, string> | undefined)?.[key] || ''}
                          onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, [key]: e.target.value } })}
                          className={cxInput((formData.examen_physique_peripherique as Record<string, string> | undefined)?.[key])} />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label htmlFor="add-autres" className="block text-xs text-gray-500 mb-1">Autres</label>
                      <textarea id="add-autres" rows={2}
                        value={formData.examen_physique_peripherique?.autres || ''}
                        onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, autres: e.target.value } })}
                        className={`${cxInput(formData.examen_physique_peripherique?.autres)} resize-none`} />
                    </div>
                  </div>
                </div>

                {filledExPhys && <SignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ SECTION 5 : Synthèse ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="V. Synthèse et diagnostic" filled={filledSynthese} />
              <div className="space-y-4">
                <div>
                  <label htmlFor="add-resume" className="block text-xs font-semibold text-gray-600 mb-1.5">Résumé syndromique</label>
                  <textarea id="add-resume" rows={3}
                    value={formData.resume_syndromique || ''}
                    onChange={e => setFormData({ ...formData, resume_syndromique: e.target.value })}
                    className={`${cxInput(formData.resume_syndromique)} resize-none`} />
                </div>
                <div>
                  <label htmlFor="add-hyp" className="block text-xs font-semibold text-gray-600 mb-1.5">Hypothèses diagnostiques</label>
                  <textarea id="add-hyp" rows={3}
                    value={formData.hypotheses_diagnostiques || ''}
                    onChange={e => setFormData({ ...formData, hypotheses_diagnostiques: e.target.value })}
                    className={`${cxInput(formData.hypotheses_diagnostiques)} resize-none`} />
                </div>
                <div>
                  <label htmlFor="add-para" className="block text-xs font-semibold text-gray-600 mb-1.5">Résultats examens paracliniques</label>
                  <textarea id="add-para" rows={3}
                    value={formData.resultats_examens_paracliniques || ''}
                    onChange={e => setFormData({ ...formData, resultats_examens_paracliniques: e.target.value })}
                    className={`${cxInput(formData.resultats_examens_paracliniques)} resize-none`} />
                </div>
                <div>
                  <label htmlFor="add-diag" className="block text-xs font-semibold text-gray-600 mb-1.5">Diagnostic retenu</label>
                  <input id="add-diag" type="text"
                    value={formData.diagnostic_retenu || ''}
                    placeholder="Ex: Insuffisance cardiaque gauche"
                    onChange={e => setFormData({ ...formData, diagnostic_retenu: e.target.value })}
                    className={cxInput(formData.diagnostic_retenu)} />
                </div>
                <div>
                  <label htmlFor="add-cat" className="block text-xs font-semibold text-gray-600 mb-1.5">CAT</label>
                  <textarea id="add-cat" rows={3}
                    value={formData.cat || ''}
                    onChange={e => setFormData({ ...formData, cat: e.target.value })}
                    className={`${cxInput(formData.cat)} resize-none`} />
                </div>
                {filledSynthese && <SignatureBanner medecin={currentUserName} role={currentUserRole} />}
              </div>
            </div>

            {/* ══ MÉDECIN TRAITANT ══ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <SectionHeader title="Médecin traitant" filled={!!formData.medecin} />
              <div>
                <label htmlFor="add-medecin" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Médecin traitant <span className="text-red-500">*</span>
                </label>
                <input id="add-medecin" type="text" required
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
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer l'observation</>}
          </button>
        </div>
      </div>
    </div>
  );
}