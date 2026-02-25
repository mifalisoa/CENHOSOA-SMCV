import { useState } from 'react';
import { X, Calendar, Clock, FileText, Activity, Stethoscope, Heart, CheckCircle, Thermometer, Weight, Ruler, HeartPulse, Wind, Droplets } from 'lucide-react';
import type { CreateObservationDTO } from '../../../../core/entities/Observation';
import type { Patient } from '../../../../core/entities/Patient';

interface AddObservationModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateObservationDTO) => Promise<void>;
}

type Step = 'info' | 'antecedents' | 'examen-general' | 'examen-physique' | 'synthese';

export default function AddObservationModal({ patient, onClose, onSubmit }: AddObservationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateObservationDTO>>({
    id_patient: patient.id_patient,
    type_observation: patient.statut_patient === 'externe' ? 'externe' : 'hospitalise',
    date_observation: new Date().toISOString().split('T')[0],
    heure_observation: new Date().toTimeString().slice(0, 5),
    medecin: '',
  });

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'info', label: 'Informations', icon: FileText },
    { id: 'antecedents', label: 'Antécédents', icon: Activity },
    { id: 'examen-general', label: 'Examen général', icon: Stethoscope },
    { id: 'examen-physique', label: 'Examen physique', icon: Heart },
    { id: 'synthese', label: 'Synthèse', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as CreateObservationDTO);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Stethoscope className="w-7 h-7" />
                Nouvelle observation médicale
              </h2>
              <p className="text-blue-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        index <= currentStepIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Informations générales */}
          {currentStep === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date d'observation *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_observation || ''}
                    onChange={(e) => setFormData({ ...formData, date_observation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.heure_observation || ''}
                    onChange={(e) => setFormData({ ...formData, heure_observation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif {formData.type_observation === 'externe' ? 'de consultation' : "d'hospitalisation"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type_observation === 'externe' ? formData.motif_consultation || '' : formData.motif_hospitalisation || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    [formData.type_observation === 'externe' ? 'motif_consultation' : 'motif_hospitalisation']: e.target.value
                  })}
                  placeholder="Ex: Douleur thoracique, fièvre persistante..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histoire de la maladie
                </label>
                <textarea
                  rows={6}
                  value={formData.histoire_maladie || ''}
                  onChange={(e) => setFormData({ ...formData, histoire_maladie: e.target.value })}
                  placeholder="Décrivez l'évolution de la maladie, les symptômes, leur début, leur intensité..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {formData.type_observation === 'hospitalise' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'entrée
                    </label>
                    <input
                      type="date"
                      value={formData.date_entree || ''}
                      onChange={(e) => setFormData({ ...formData, date_entree: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnostic d'entrée
                    </label>
                    <input
                      type="text"
                      value={formData.diagnostic_entree || ''}
                      onChange={(e) => setFormData({ ...formData, diagnostic_entree: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Antécédents */}
          {currentStep === 'antecedents' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Antécédents CMO
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chirurgicaux</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_cmo?.chirurgicaux || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_cmo: { ...formData.antecedents_cmo, chirurgicaux: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Médicaux</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_cmo?.medicaux || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_cmo: { ...formData.antecedents_cmo, medicaux: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gynéco-obstétricaux</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_cmo?.gyneco_obstetricaux || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_cmo: { ...formData.antecedents_cmo, gyneco_obstetricaux: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-900 mb-4">Antécédents GMO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Génétique</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_gmo?.genetique || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_gmo: { ...formData.antecedents_gmo, genetique: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode de vie</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_gmo?.mode_vie || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_gmo: { ...formData.antecedents_gmo, mode_vie: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per Os</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_gmo?.per_os || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_gmo: { ...formData.antecedents_gmo, per_os: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Antécédents CHE</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum vitae</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_che?.curriculum_vitae || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_che: { ...formData.antecedents_che, curriculum_vitae: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospitalisation</label>
                    <textarea
                      rows={2}
                      value={formData.antecedents_che?.hospitalisation || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_che: { ...formData.antecedents_che, hospitalisation: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau socio-économique</label>
                    <input
                      type="text"
                      value={formData.antecedents_che?.niveau_socio_economique || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        antecedents_che: { ...formData.antecedents_che, niveau_socio_economique: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Examen général */}
          {currentStep === 'examen-general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">État général</label>
                  <input
                    type="text"
                    value={formData.examen_general?.etat_general || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, etat_general: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conscience</label>
                  <input
                    type="text"
                    value={formData.examen_general?.conscience || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, conscience: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    Température (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.examen_general?.temperature || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, temperature: parseFloat(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.examen_general?.poids || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, poids: parseFloat(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.examen_general?.taille || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, taille: parseFloat(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IMC</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.examen_general?.imc || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, imc: parseFloat(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <HeartPulse className="w-4 h-4" />
                    FC (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.examen_general?.frequence_cardiaque || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, frequence_cardiaque: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Wind className="w-4 h-4" />
                    FR (rpm)
                  </label>
                  <input
                    type="number"
                    value={formData.examen_general?.frequence_respiratoire || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, frequence_respiratoire: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                  <input
                    type="number"
                    value={formData.examen_general?.saturation_oxygene || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, saturation_oxygene: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TA Gauche (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.examen_general?.tension_arterielle_gauche || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, tension_arterielle_gauche: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TA Droite (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.examen_general?.tension_arterielle_droite || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, tension_arterielle_droite: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Droplets className="w-4 h-4" />
                    Diurèse
                  </label>
                  <input
                    type="text"
                    value={formData.examen_general?.diurese || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, diurese: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tour de taille (cm)</label>
                  <input
                    type="number"
                    value={formData.examen_general?.tour_taille || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      examen_general: { ...formData.examen_general, tour_taille: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Examen physique */}
          {currentStep === 'examen-physique' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Examen physique central
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choc de pointe</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.choc_pointe || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, choc_pointe: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BDC</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.bdc || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, bdc: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Souffles</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.souffles || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, souffles: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pouls périphériques</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.pouls_peripheriques || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, pouls_peripheriques: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Veines jugulaires</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.veines_jugulaires || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, veines_jugulaires: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appareil respiratoire</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.appareil_respiratoire || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, appareil_respiratoire: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foie</label>
                    <input
                      type="text"
                      value={formData.examen_physique_central?.foie || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_central: { ...formData.examen_physique_central, foie: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-900 mb-4">Examen physique périphérique</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conjonctives et muqueuses</label>
                    <input
                      type="text"
                      value={formData.examen_physique_peripherique?.conjonctives_muqueuses || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_peripherique: { ...formData.examen_physique_peripherique, conjonctives_muqueuses: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">État bucco-dentaire</label>
                    <input
                      type="text"
                      value={formData.examen_physique_peripherique?.etat_bucco_dentaire || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_peripherique: { ...formData.examen_physique_peripherique, etat_bucco_dentaire: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Abdomen</label>
                    <input
                      type="text"
                      value={formData.examen_physique_peripherique?.abdomen || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_peripherique: { ...formData.examen_physique_peripherique, abdomen: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Membres inférieurs / OMI</label>
                    <input
                      type="text"
                      value={formData.examen_physique_peripherique?.membres_inferieurs_omi || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_peripherique: { ...formData.examen_physique_peripherique, membres_inferieurs_omi: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autres observations</label>
                    <textarea
                      rows={3}
                      value={formData.examen_physique_peripherique?.autres || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examen_physique_peripherique: { ...formData.examen_physique_peripherique, autres: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Synthèse */}
          {currentStep === 'synthese' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Résumé syndromique</label>
                <textarea
                  rows={3}
                  value={formData.resume_syndromique || ''}
                  onChange={(e) => setFormData({ ...formData, resume_syndromique: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hypothèses diagnostiques</label>
                <textarea
                  rows={3}
                  value={formData.hypotheses_diagnostiques || ''}
                  onChange={(e) => setFormData({ ...formData, hypotheses_diagnostiques: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Résultats examens paracliniques</label>
                <textarea
                  rows={3}
                  value={formData.resultats_examens_paracliniques || ''}
                  onChange={(e) => setFormData({ ...formData, resultats_examens_paracliniques: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic retenu *</label>
                <input
                  type="text"
                  required
                  value={formData.diagnostic_retenu || ''}
                  onChange={(e) => setFormData({ ...formData, diagnostic_retenu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conduite à tenir (CAT) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.cat || ''}
                  onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                  placeholder="Prescriptions, examens complémentaires, orientation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Évolution quotidienne</label>
                <textarea
                  rows={3}
                  value={formData.evolution_quotidienne || ''}
                  onChange={(e) => setFormData({ ...formData, evolution_quotidienne: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Médecin traitant *</label>
                <input
                  type="text"
                  required
                  value={formData.medecin || ''}
                  onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
                  placeholder="Dr. Nom Prénom"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ← Précédent
          </button>

          <div className="text-sm text-gray-500">
            Étape {currentStepIndex + 1} sur {steps.length}
          </div>

          {currentStepIndex === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium shadow-sm"
            >
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}