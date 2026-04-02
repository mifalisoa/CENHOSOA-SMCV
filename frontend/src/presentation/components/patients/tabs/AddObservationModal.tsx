import { useState } from 'react';
import { X, Calendar, Clock, FileText, Activity, Stethoscope, Heart, CheckCircle2, Thermometer, Weight, Ruler, HeartPulse, Wind, Droplets, AlertTriangle } from 'lucide-react';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import type { Patient } from '../../../../core/entities/Patient';

interface AddObservationModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateObservationDTO) => Promise<void>;
}

type Step = 'info' | 'antecedents' | 'examen-general' | 'examen-physique' | 'synthese';

interface StepConfig {
  id: Step;
  label: string;
  icon: typeof FileText;
}

// ── IMC ───────────────────────────────────────────────────────────────────────
function getIMCStatus(imc?: number): { label: string; color: string } | null {
  if (!imc) return null;
  if (imc < 18.5) return { label: '⚠️ Maigreur',  color: 'text-red-600'   };
  if (imc < 25)   return { label: '✅ Normal',     color: 'text-green-600' };
  if (imc < 30)   return { label: '⚠️ Surpoids',   color: 'text-red-600'  };
  return             { label: '⚠️ Obésité',    color: 'text-red-600'   };
}

// ── Classes input — 3 couleurs ────────────────────────────────────────────────
const BASE = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all';
function cxInput(value: unknown, req = false, touched = false): string {
  const filled = value !== undefined && value !== null && String(value).trim() !== '';
  if (req && touched && !filled) return `${BASE} border-red-300 bg-red-50 focus:ring-red-100`;
  if (filled)                    return `${BASE} border-green-300 bg-green-50 focus:ring-green-100`;
  return                                `${BASE} border-gray-300 focus:border-cyan-400 focus:ring-cyan-100`;
}
const BASE_NEUTRAL = `${BASE} border-gray-300 focus:border-cyan-400 focus:ring-cyan-100`;

export default function AddObservationModal({ patient, onClose, onSubmit }: AddObservationModalProps) {
  const [currentStep,   setCurrentStep]   = useState<Step>('info');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CreateObservationDTO>>({
    id_patient:        patient.id_patient,
    type_observation:  patient.statut_patient === 'externe' ? 'externe' : 'hospitalise',
    date_observation:  new Date().toISOString().split('T')[0],
    heure_observation: new Date().toTimeString().slice(0, 5),
    medecin:           '',
  });

  const calculateIMC = (poids?: number, taille?: number): number | undefined => {
    if (!poids || !taille || poids <= 0 || taille <= 0) return undefined;
    const tailleEnMetres = taille / 100;
    const imc = poids / (tailleEnMetres * tailleEnMetres);
    return Math.round(imc * 10) / 10;
  };

  const steps: StepConfig[] = [
    { id: 'info',            label: 'Informations',    icon: FileText     },
    { id: 'antecedents',     label: 'Antécédents',     icon: Activity     },
    { id: 'examen-general',  label: 'Examen général',  icon: Stethoscope  },
    { id: 'examen-physique', label: 'Examen physique', icon: Heart        },
    { id: 'synthese',        label: 'Synthèse',        icon: CheckCircle2 },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const validateStep = (stepId: Step): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (stepId === 'info') {
      if (!formData.date_observation)  errors.push('Date d\'observation');
      if (!formData.heure_observation) errors.push('Heure');
      if (formData.type_observation === 'externe'     && !formData.motif_consultation)    errors.push('Motif de consultation');
      if (formData.type_observation === 'hospitalise' && !formData.motif_hospitalisation) errors.push('Motif d\'hospitalisation');
    }
    if (stepId === 'synthese') {
      if (!formData.diagnostic_retenu) errors.push('Diagnostic retenu');
      if (!formData.cat)               errors.push('Conduite à tenir (CAT)');
      if (!formData.medecin)           errors.push('Médecin traitant');
    }
    return { isValid: errors.length === 0, errors };
  };

  const mark = (...fields: string[]) =>
    setTouchedFields(p => ({ ...p, ...Object.fromEntries(fields.map(f => [f, true])) }));

  const handleNext = () => {
    const { isValid, errors } = validateStep(currentStep);
    if (!isValid) {
      if (currentStep === 'info') mark('date_observation', 'heure_observation', 'motif');
      setError(`Veuillez remplir les champs obligatoires : ${errors.join(', ')}`);
      return;
    }
    setError(null);
    if (currentStepIndex < steps.length - 1) setCurrentStep(steps[currentStepIndex + 1].id);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) setCurrentStep(steps[currentStepIndex - 1].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateStep('synthese');
    if (!isValid) {
      mark('diagnostic_retenu', 'cat', 'medecin');
      setError(`Champs obligatoires manquants : ${errors.join(', ')}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cleanPayload: CreateObservationDTO = {
        id_patient:                      formData.id_patient!,
        type_observation:                formData.type_observation!,
        date_observation:                formData.date_observation!,
        heure_observation:               formData.heure_observation!,
        medecin:                         formData.medecin || '',
        motif_consultation:              formData.motif_consultation || undefined,
        motif_hospitalisation:           formData.motif_hospitalisation || undefined,
        histoire_maladie:                formData.histoire_maladie || undefined,
        date_entree:                     formData.date_entree || undefined,
        diagnostic_entree:               formData.diagnostic_entree || undefined,
        antecedents_cmo:                 formData.antecedents_cmo || undefined,
        antecedents_gmo:                 formData.antecedents_gmo || undefined,
        antecedents_che:                 formData.antecedents_che || undefined,
        examen_general:                  formData.examen_general || undefined,
        examen_physique_central:         formData.examen_physique_central || undefined,
        examen_physique_peripherique:    formData.examen_physique_peripherique || undefined,
        resume_syndromique:              formData.resume_syndromique || undefined,
        hypotheses_diagnostiques:        formData.hypotheses_diagnostiques || undefined,
        resultats_examens_paracliniques: formData.resultats_examens_paracliniques || undefined,
        diagnostic_retenu:               formData.diagnostic_retenu || '',
        cat:                             formData.cat || '',
        evolution_quotidienne:           formData.evolution_quotidienne || undefined,
      };
      await onSubmit(cleanPayload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const isExt          = formData.type_observation === 'externe';
  const motif          = isExt ? formData.motif_consultation : formData.motif_hospitalisation;
  const imcSt          = getIMCStatus(formData.examen_general?.imc);
  const isSyntheseValid = validateStep('synthese').isValid;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header — cyan uniforme ── */}
        <div className="bg-cyan-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="truncate">Nouvelle observation médicale</span>
              </h2>
              <p className="text-cyan-100 text-xs sm:text-sm truncate">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button onClick={onClose} aria-label="Fermer"
              className="text-white/80 hover:text-white p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ── Stepper — cyan ── */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b overflow-x-auto">
          <div className="flex items-center justify-between min-w-max sm:min-w-0">
            {steps.map((step, index) => {
              const StepIcon  = step.icon;
              const isDone    = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1 min-w-[60px] sm:min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone || isCurrent ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isDone
                        ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      }
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 font-medium text-center ${
                      isDone || isCurrent ? 'text-cyan-600' : 'text-gray-400'
                    }`}>{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-all ${
                      index < currentStepIndex ? 'bg-cyan-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">

          {/* ═══════════ STEP 1 : Informations générales ═══════════ */}
          {currentStep === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-observation"
                    className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date d'observation <span className="text-red-500">*</span>
                    </span>
                    {formData.date_observation && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  </label>
                  <input id="date-observation" type="date" required
                    value={formData.date_observation || ''}
                    onChange={e => setFormData({ ...formData, date_observation: e.target.value })}
                    className={cxInput(formData.date_observation, true, touchedFields['date_observation'])} />
                </div>
                <div>
                  <label htmlFor="heure-observation"
                    className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Heure <span className="text-red-500">*</span>
                    </span>
                    {formData.heure_observation && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  </label>
                  <input id="heure-observation" type="time" required
                    value={formData.heure_observation || ''}
                    onChange={e => setFormData({ ...formData, heure_observation: e.target.value })}
                    className={cxInput(formData.heure_observation, true, touchedFields['heure_observation'])} />
                </div>
              </div>

              <div>
                <label htmlFor="motif"
                  className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Motif {isExt ? 'de consultation' : "d'hospitalisation"} <span className="text-red-500">*</span></span>
                  {motif         && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  {touchedFields['motif'] && !motif && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                </label>
                <input id="motif" type="text" required
                  value={motif || ''}
                  placeholder="Ex: Douleur thoracique, fièvre persistante..."
                  onChange={e => setFormData({ ...formData, [isExt ? 'motif_consultation' : 'motif_hospitalisation']: e.target.value })}
                  className={cxInput(motif, true, touchedFields['motif'])} />
                {touchedFields['motif'] && !motif && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Champ obligatoire</p>
                )}
              </div>

              <div>
                <label htmlFor="histoire-maladie" className="block text-sm font-medium text-gray-700 mb-2">
                  Histoire de la maladie
                </label>
                <textarea id="histoire-maladie" rows={6}
                  value={formData.histoire_maladie || ''}
                  onChange={e => setFormData({ ...formData, histoire_maladie: e.target.value })}
                  placeholder="Décrivez l'évolution de la maladie, les symptômes, leur début, leur intensité..."
                  className={`${BASE_NEUTRAL} resize-none`} />
              </div>

              {formData.type_observation === 'hospitalise' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date-entree" className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'entrée
                    </label>
                    <input id="date-entree" type="date"
                      value={formData.date_entree || ''}
                      onChange={e => setFormData({ ...formData, date_entree: e.target.value })}
                      className={BASE_NEUTRAL} />
                  </div>
                  <div>
                    <label htmlFor="diagnostic-entree" className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnostic d'entrée
                    </label>
                    <input id="diagnostic-entree" type="text"
                      value={formData.diagnostic_entree || ''}
                      onChange={e => setFormData({ ...formData, diagnostic_entree: e.target.value })}
                      className={BASE_NEUTRAL} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ STEP 2 : Antécédents ═══════════ */}
          {currentStep === 'antecedents' && (
            <div className="space-y-6">
              {/* CMO */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-500" />
                  Antécédents CMO
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ant-chirurgicaux" className="block text-sm font-medium text-gray-700 mb-2">Chirurgicaux</label>
                    <textarea id="ant-chirurgicaux" rows={2}
                      value={formData.antecedents_cmo?.chirurgicaux || ''}
                      onChange={e => setFormData({ ...formData, antecedents_cmo: { ...formData.antecedents_cmo, chirurgicaux: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-medicaux" className="block text-sm font-medium text-gray-700 mb-2">Médicaux</label>
                    <textarea id="ant-medicaux" rows={2}
                      value={formData.antecedents_cmo?.medicaux || ''}
                      onChange={e => setFormData({ ...formData, antecedents_cmo: { ...formData.antecedents_cmo, medicaux: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-gyneco" className="block text-sm font-medium text-gray-700 mb-2">Gynéco-obstétricaux</label>
                    <textarea id="ant-gyneco" rows={2}
                      value={formData.antecedents_cmo?.gyneco_obstetricaux || ''}
                      onChange={e => setFormData({ ...formData, antecedents_cmo: { ...formData.antecedents_cmo, gyneco_obstetricaux: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                </div>
              </div>

              {/* GMO */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Antécédents GMO</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ant-genetique" className="block text-sm font-medium text-gray-700 mb-2">Génétique</label>
                    <textarea id="ant-genetique" rows={2}
                      value={formData.antecedents_gmo?.genetique || ''}
                      onChange={e => setFormData({ ...formData, antecedents_gmo: { ...formData.antecedents_gmo, genetique: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-mode-vie" className="block text-sm font-medium text-gray-700 mb-2">Mode de vie</label>
                    <textarea id="ant-mode-vie" rows={2}
                      value={formData.antecedents_gmo?.mode_vie || ''}
                      onChange={e => setFormData({ ...formData, antecedents_gmo: { ...formData.antecedents_gmo, mode_vie: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-per-os" className="block text-sm font-medium text-gray-700 mb-2">Per Os</label>
                    <textarea id="ant-per-os" rows={2}
                      value={formData.antecedents_gmo?.per_os || ''}
                      onChange={e => setFormData({ ...formData, antecedents_gmo: { ...formData.antecedents_gmo, per_os: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                </div>
              </div>

              {/* CHE */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Antécédents CHE</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ant-cv" className="block text-sm font-medium text-gray-700 mb-2">Curriculum vitae</label>
                    <textarea id="ant-cv" rows={2}
                      value={formData.antecedents_che?.curriculum_vitae || ''}
                      onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, curriculum_vitae: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-hospit" className="block text-sm font-medium text-gray-700 mb-2">Hospitalisation</label>
                    <textarea id="ant-hospit" rows={2}
                      value={formData.antecedents_che?.hospitalisation || ''}
                      onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, hospitalisation: e.target.value } })}
                      className={`${BASE_NEUTRAL} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="ant-socio" className="block text-sm font-medium text-gray-700 mb-2">Niveau socio-économique</label>
                    <input id="ant-socio" type="text"
                      value={formData.antecedents_che?.niveau_socio_economique || ''}
                      onChange={e => setFormData({ ...formData, antecedents_che: { ...formData.antecedents_che, niveau_socio_economique: e.target.value } })}
                      className={BASE_NEUTRAL} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 3 : Examen général ═══════════ */}
          {currentStep === 'examen-general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="etat-general" className="block text-sm font-medium text-gray-700 mb-2">État général</label>
                  <input id="etat-general" type="text"
                    value={formData.examen_general?.etat_general || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, etat_general: e.target.value } })}
                    className={cxInput(formData.examen_general?.etat_general)} />
                </div>
                <div>
                  <label htmlFor="conscience" className="block text-sm font-medium text-gray-700 mb-2">Conscience</label>
                  <input id="conscience" type="text"
                    value={formData.examen_general?.conscience || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, conscience: e.target.value } })}
                    className={cxInput(formData.examen_general?.conscience)} />
                </div>
                <div>
                  <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    Température (°C)
                  </label>
                  <input id="temperature" type="number" step="0.1"
                    value={formData.examen_general?.temperature || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, temperature: parseFloat(e.target.value) } })}
                    className={cxInput(formData.examen_general?.temperature)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="poids" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    Poids (kg)
                  </label>
                  <input id="poids" type="number" step="0.1"
                    value={formData.examen_general?.poids || ''}
                    onChange={e => {
                      const nouveauPoids = parseFloat(e.target.value) || undefined;
                      const taille = formData.examen_general?.taille;
                      const imc = calculateIMC(nouveauPoids, taille);
                      setFormData({ ...formData, examen_general: { ...formData.examen_general, poids: nouveauPoids, imc } });
                    }}
                    className={cxInput(formData.examen_general?.poids)} />
                </div>
                <div>
                  <label htmlFor="taille" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    Taille (cm)
                  </label>
                  <input id="taille" type="number"
                    value={formData.examen_general?.taille || ''}
                    onChange={e => {
                      const nouvelleTaille = parseFloat(e.target.value) || undefined;
                      const poids = formData.examen_general?.poids;
                      const imc = calculateIMC(poids, nouvelleTaille);
                      setFormData({ ...formData, examen_general: { ...formData.examen_general, taille: nouvelleTaille, imc } });
                    }}
                    className={cxInput(formData.examen_general?.taille)} />
                </div>
                <div>
                  <label htmlFor="imc" className="block text-sm font-medium text-gray-700 mb-2">IMC (calculé)</label>
                  <input id="imc" type="number" step="0.1" readOnly
                    value={formData.examen_general?.imc || ''}
                    title="Calculé automatiquement à partir du poids et de la taille"
                    placeholder="Auto"
                    className={`${BASE} border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed`} />
                  {/* ✅ IMC coloré selon statut */}
                  {imcSt
                    ? <p className={`text-xs mt-1 font-medium ${imcSt.color}`}>{imcSt.label}</p>
                    : <p className="text-xs text-gray-500 mt-1 min-h-[20px]"></p>
                  }
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fc" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <HeartPulse className="w-4 h-4" />
                    FC (bpm)
                  </label>
                  <input id="fc" type="number"
                    value={formData.examen_general?.frequence_cardiaque || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_cardiaque: parseInt(e.target.value) } })}
                    className={cxInput(formData.examen_general?.frequence_cardiaque)} />
                </div>
                <div>
                  <label htmlFor="fr" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Wind className="w-4 h-4" />
                    FR (rpm)
                  </label>
                  <input id="fr" type="number"
                    value={formData.examen_general?.frequence_respiratoire || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, frequence_respiratoire: parseInt(e.target.value) } })}
                    className={cxInput(formData.examen_general?.frequence_respiratoire)} />
                </div>
                <div>
                  <label htmlFor="spo2" className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                  <input id="spo2" type="number"
                    value={formData.examen_general?.saturation_oxygene || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, saturation_oxygene: parseInt(e.target.value) } })}
                    className={cxInput(formData.examen_general?.saturation_oxygene)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ta-gauche" className="block text-sm font-medium text-gray-700 mb-2">TA Gauche (mmHg)</label>
                  <input id="ta-gauche" type="text" placeholder="120/80"
                    value={formData.examen_general?.tension_arterielle_gauche || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_gauche: e.target.value } })}
                    className={cxInput(formData.examen_general?.tension_arterielle_gauche)} />
                </div>
                <div>
                  <label htmlFor="ta-droite" className="block text-sm font-medium text-gray-700 mb-2">TA Droite (mmHg)</label>
                  <input id="ta-droite" type="text" placeholder="120/80"
                    value={formData.examen_general?.tension_arterielle_droite || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tension_arterielle_droite: e.target.value } })}
                    className={cxInput(formData.examen_general?.tension_arterielle_droite)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="diurese" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Droplets className="w-4 h-4" />
                    Diurèse
                  </label>
                  <input id="diurese" type="text"
                    value={formData.examen_general?.diurese || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, diurese: e.target.value } })}
                    className={cxInput(formData.examen_general?.diurese)} />
                </div>
                <div>
                  <label htmlFor="tour-taille" className="block text-sm font-medium text-gray-700 mb-2">Tour de taille (cm)</label>
                  <input id="tour-taille" type="number"
                    value={formData.examen_general?.tour_taille || ''}
                    onChange={e => setFormData({ ...formData, examen_general: { ...formData.examen_general, tour_taille: parseInt(e.target.value) } })}
                    className={cxInput(formData.examen_general?.tour_taille)} />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 4 : Examen physique ═══════════ */}
          {currentStep === 'examen-physique' && (
            <div className="space-y-6">
              {/* Central */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-500" />
                  Examen physique central
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="choc-pointe" className="block text-sm font-medium text-gray-700 mb-2">Choc de pointe</label>
                    <input id="choc-pointe" type="text"
                      value={formData.examen_physique_central?.choc_pointe || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, choc_pointe: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.choc_pointe)} />
                  </div>
                  <div>
                    <label htmlFor="bdc" className="block text-sm font-medium text-gray-700 mb-2">BDC</label>
                    <input id="bdc" type="text"
                      value={formData.examen_physique_central?.bdc || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, bdc: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.bdc)} />
                  </div>
                  <div>
                    <label htmlFor="souffles" className="block text-sm font-medium text-gray-700 mb-2">Souffles</label>
                    <input id="souffles" type="text"
                      value={formData.examen_physique_central?.souffles || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, souffles: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.souffles)} />
                  </div>
                  <div>
                    <label htmlFor="pouls-periph" className="block text-sm font-medium text-gray-700 mb-2">Pouls périphériques</label>
                    <input id="pouls-periph" type="text"
                      value={formData.examen_physique_central?.pouls_peripheriques || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, pouls_peripheriques: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.pouls_peripheriques)} />
                  </div>
                  <div>
                    <label htmlFor="veines-jug" className="block text-sm font-medium text-gray-700 mb-2">Veines jugulaires</label>
                    <input id="veines-jug" type="text"
                      value={formData.examen_physique_central?.veines_jugulaires || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, veines_jugulaires: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.veines_jugulaires)} />
                  </div>
                  <div>
                    <label htmlFor="app-resp" className="block text-sm font-medium text-gray-700 mb-2">Appareil respiratoire</label>
                    <input id="app-resp" type="text"
                      value={formData.examen_physique_central?.appareil_respiratoire || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, appareil_respiratoire: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.appareil_respiratoire)} />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="foie" className="block text-sm font-medium text-gray-700 mb-2">Foie</label>
                    <input id="foie" type="text"
                      value={formData.examen_physique_central?.foie || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_central: { ...formData.examen_physique_central, foie: e.target.value } })}
                      className={cxInput(formData.examen_physique_central?.foie)} />
                  </div>
                </div>
              </div>

              {/* Périphérique */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Examen physique périphérique</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="conj-muq" className="block text-sm font-medium text-gray-700 mb-2">Conjonctives et muqueuses</label>
                    <input id="conj-muq" type="text"
                      value={formData.examen_physique_peripherique?.conjonctives_muqueuses || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, conjonctives_muqueuses: e.target.value } })}
                      className={cxInput(formData.examen_physique_peripherique?.conjonctives_muqueuses)} />
                  </div>
                  <div>
                    <label htmlFor="bucco-dent" className="block text-sm font-medium text-gray-700 mb-2">État bucco-dentaire</label>
                    <input id="bucco-dent" type="text"
                      value={formData.examen_physique_peripherique?.etat_bucco_dentaire || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, etat_bucco_dentaire: e.target.value } })}
                      className={cxInput(formData.examen_physique_peripherique?.etat_bucco_dentaire)} />
                  </div>
                  <div>
                    <label htmlFor="abdomen" className="block text-sm font-medium text-gray-700 mb-2">Abdomen</label>
                    <input id="abdomen" type="text"
                      value={formData.examen_physique_peripherique?.abdomen || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, abdomen: e.target.value } })}
                      className={cxInput(formData.examen_physique_peripherique?.abdomen)} />
                  </div>
                  <div>
                    <label htmlFor="mi-omi" className="block text-sm font-medium text-gray-700 mb-2">Membres inférieurs / OMI</label>
                    <input id="mi-omi" type="text"
                      value={formData.examen_physique_peripherique?.membres_inferieurs_omi || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, membres_inferieurs_omi: e.target.value } })}
                      className={cxInput(formData.examen_physique_peripherique?.membres_inferieurs_omi)} />
                  </div>
                  <div>
                    <label htmlFor="autres-obs" className="block text-sm font-medium text-gray-700 mb-2">Autres observations</label>
                    <textarea id="autres-obs" rows={3}
                      value={formData.examen_physique_peripherique?.autres || ''}
                      onChange={e => setFormData({ ...formData, examen_physique_peripherique: { ...formData.examen_physique_peripherique, autres: e.target.value } })}
                      className={`${cxInput(formData.examen_physique_peripherique?.autres)} resize-none`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 5 : Synthèse ═══════════ */}
          {currentStep === 'synthese' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="resume-synd" className="block text-sm font-medium text-gray-700 mb-2">Résumé syndromique</label>
                <textarea id="resume-synd" rows={3}
                  value={formData.resume_syndromique || ''}
                  onChange={e => setFormData({ ...formData, resume_syndromique: e.target.value })}
                  className={`${cxInput(formData.resume_syndromique)} resize-none`} />
              </div>

              <div>
                <label htmlFor="hyp-diag" className="block text-sm font-medium text-gray-700 mb-2">Hypothèses diagnostiques</label>
                <textarea id="hyp-diag" rows={3}
                  value={formData.hypotheses_diagnostiques || ''}
                  onChange={e => setFormData({ ...formData, hypotheses_diagnostiques: e.target.value })}
                  className={`${cxInput(formData.hypotheses_diagnostiques)} resize-none`} />
              </div>

              <div>
                <label htmlFor="exam-para" className="block text-sm font-medium text-gray-700 mb-2">Résultats examens paracliniques</label>
                <textarea id="exam-para" rows={3}
                  value={formData.resultats_examens_paracliniques || ''}
                  onChange={e => setFormData({ ...formData, resultats_examens_paracliniques: e.target.value })}
                  className={`${cxInput(formData.resultats_examens_paracliniques)} resize-none`} />
              </div>

              <div>
                <label htmlFor="diag-retenu"
                  className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Diagnostic retenu <span className="text-red-500">*</span></span>
                  {formData.diagnostic_retenu  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  {touchedFields['diagnostic_retenu'] && !formData.diagnostic_retenu && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                </label>
                <input id="diag-retenu" type="text" required
                  value={formData.diagnostic_retenu || ''}
                  placeholder="Ex: Pneumonie aiguë communautaire"
                  onChange={e => setFormData({ ...formData, diagnostic_retenu: e.target.value })}
                  onBlur={() => mark('diagnostic_retenu')}
                  className={cxInput(formData.diagnostic_retenu, true, touchedFields['diagnostic_retenu'])} />
                {touchedFields['diagnostic_retenu'] && !formData.diagnostic_retenu && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Champ obligatoire</p>
                )}
              </div>

              <div>
                <label htmlFor="cat"
                  className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Conduite à tenir (CAT) <span className="text-red-500">*</span></span>
                  {formData.cat  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  {touchedFields['cat'] && !formData.cat && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                </label>
                <textarea id="cat" rows={4} required
                  value={formData.cat || ''}
                  placeholder="Prescriptions, examens complémentaires, orientation..."
                  onChange={e => setFormData({ ...formData, cat: e.target.value })}
                  onBlur={() => mark('cat')}
                  className={`${cxInput(formData.cat, true, touchedFields['cat'])} resize-none`} />
                {touchedFields['cat'] && !formData.cat && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Champ obligatoire</p>
                )}
              </div>

              <div>
                <label htmlFor="evol-quot" className="block text-sm font-medium text-gray-700 mb-2">Évolution quotidienne</label>
                <textarea id="evol-quot" rows={3}
                  value={formData.evolution_quotidienne || ''}
                  onChange={e => setFormData({ ...formData, evolution_quotidienne: e.target.value })}
                  className={`${cxInput(formData.evolution_quotidienne)} resize-none`} />
              </div>

              <div>
                <label htmlFor="medecin"
                  className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Médecin traitant <span className="text-red-500">*</span></span>
                  {formData.medecin  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                  {touchedFields['medecin'] && !formData.medecin && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                </label>
                <input id="medecin" type="text" required
                  value={formData.medecin || ''}
                  placeholder="Dr. Nom Prénom"
                  onChange={e => setFormData({ ...formData, medecin: e.target.value })}
                  onBlur={() => mark('medecin')}
                  className={cxInput(formData.medecin, true, touchedFields['medecin'])} />
                {touchedFields['medecin'] && !formData.medecin && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Champ obligatoire</p>
                )}
              </div>
            </div>
          )}

        </form>

        {/* ── Footer navigation ── */}
        <div className="border-t bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button type="button" onClick={handlePrevious} disabled={currentStepIndex === 0}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base order-2 sm:order-1">
            ← Précédent
          </button>

          <div className="text-xs sm:text-sm text-gray-500 order-1 sm:order-2">
            Étape {currentStepIndex + 1} sur {steps.length}
          </div>

          {currentStepIndex === steps.length - 1 ? (
            /* ✅ Bouton Enregistrer — grisé si synthèse invalide */
            <button type="button" onClick={handleSubmit} disabled={loading}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg transition-all disabled:cursor-not-allowed font-medium shadow-md flex items-center justify-center gap-2 text-sm sm:text-base order-3 ${
                isSyntheseValid && !loading
                  ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                : <><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />Enregistrer</>
              }
            </button>
          ) : (
            <button type="button" onClick={handleNext}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all font-medium shadow-md text-sm sm:text-base order-3">
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}