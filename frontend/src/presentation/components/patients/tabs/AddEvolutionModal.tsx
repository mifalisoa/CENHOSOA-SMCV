import { useState } from 'react';
import { X, Calendar, Clock, User, AlertTriangle, CheckCircle2,
         Thermometer, HeartPulse, Wind, Droplets } from 'lucide-react';
import type { CreateEvolutionPatientDTO } from '../../../../core/entities/EvolutionPatient';
import type { Observation } from '../../../../core/entities/Observation';
import type { Patient } from '../../../../core/entities/Patient';
import { useAuth } from '../../../hooks/useAuth';

interface AddEvolutionModalProps {
  patient:     Patient;
  observation: Observation;
  onClose:     () => void;
  onSubmit:    (data: CreateEvolutionPatientDTO) => Promise<void>;
}

const BASE = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm';
const cx   = (v: unknown) => v
  ? `${BASE} border-green-300 bg-green-50 focus:ring-green-100`
  : `${BASE} border-gray-300 focus:border-cyan-400 focus:ring-cyan-100`;

export default function AddEvolutionModal({ patient, observation, onClose, onSubmit }: AddEvolutionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [form, setForm] = useState<Partial<CreateEvolutionPatientDTO>>({
    id_observation: observation.id_observation,
    id_patient:     patient.id_patient,
    date_visite:    new Date().toISOString().split('T')[0],
    heure_visite:   new Date().toTimeString().slice(0, 5),
    medecin:        `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim(),
  });

  const set = (key: keyof CreateEvolutionPatientDTO, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setParam = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, parametres: { ...prev.parametres, [key]: value } }));

  const setCentral = (key: string, value: string) =>
    setForm(prev => ({ ...prev, examen_physique_central: { ...prev.examen_physique_central, [key]: value } }));

  const setPeriph = (key: string, value: string) =>
    setForm(prev => ({ ...prev, examen_physique_peripherique: { ...prev.examen_physique_peripherique, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medecin?.trim()) { setError('Le médecin est requis'); return; }
    if (!form.heure_visite?.trim()) { setError("L'heure de visite est requise"); return; }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form as CreateEvolutionPatientDTO);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-cyan-600 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Mise à jour — Fiche évolution</h2>
            <p className="text-cyan-100 text-xs mt-0.5">
              {patient.nom_patient} {patient.prenom_patient} · Observation du{' '}
              {new Date(observation.date_observation).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Identité visite */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="evol-date" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />Date <span className="text-red-500">*</span>
              </label>
              <input id="evol-date" type="date" required
                value={form.date_visite || ''}
                onChange={e => set('date_visite', e.target.value)}
                className={cx(form.date_visite)} />
            </div>
            <div>
              <label htmlFor="evol-heure" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />Heure <span className="text-red-500">*</span>
              </label>
              <input id="evol-heure" type="time" required
                value={form.heure_visite || ''}
                onChange={e => set('heure_visite', e.target.value)}
                className={cx(form.heure_visite)} />
            </div>
            <div>
              <label htmlFor="evol-medecin" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />Équipe Dr <span className="text-red-500">*</span>
              </label>
              <input id="evol-medecin" type="text" required
                placeholder="Dr. Nom Prénom"
                value={form.medecin || ''}
                onChange={e => set('medecin', e.target.value)}
                className={cx(form.medecin)} />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label htmlFor="evol-resume" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Résumé concernant le patient
            </label>
            <textarea id="evol-resume" rows={3}
              value={form.resume_patient || ''}
              onChange={e => set('resume_patient', e.target.value)}
              placeholder="État général du patient, évolution depuis la dernière visite..."
              className={`${cx(form.resume_patient)} resize-none`} />
          </div>

          {/* Paramètres vitaux */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Paramètres vitaux</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="evol-etat-gen" className="block text-xs text-gray-500 mb-1">État général</label>
                <input id="evol-etat-gen" type="text"
                  value={form.parametres?.etat_general || ''}
                  onChange={e => setParam('etat_general', e.target.value)}
                  className={cx(form.parametres?.etat_general)} />
              </div>
              <div>
                <label htmlFor="evol-conscience" className="block text-xs text-gray-500 mb-1">Conscience</label>
                <input id="evol-conscience" type="text"
                  value={form.parametres?.conscience || ''}
                  onChange={e => setParam('conscience', e.target.value)}
                  className={cx(form.parametres?.conscience)} />
              </div>
              <div>
                <label htmlFor="evol-temp" className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />T° (°C)
                </label>
                <input id="evol-temp" type="number" step="0.1"
                  aria-label="Température en degrés Celsius"
                  value={form.parametres?.temperature || ''}
                  onChange={e => setParam('temperature', parseFloat(e.target.value))}
                  className={cx(form.parametres?.temperature)} />
              </div>
              <div>
                <label htmlFor="evol-fc" className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3" />FC (bpm)
                </label>
                <input id="evol-fc" type="number"
                  aria-label="Fréquence cardiaque"
                  value={form.parametres?.frequence_cardiaque || ''}
                  onChange={e => setParam('frequence_cardiaque', parseInt(e.target.value))}
                  className={cx(form.parametres?.frequence_cardiaque)} />
              </div>
              <div>
                <label htmlFor="evol-fr" className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3" />FR (rpm)
                </label>
                <input id="evol-fr" type="number"
                  aria-label="Fréquence respiratoire"
                  value={form.parametres?.frequence_respiratoire || ''}
                  onChange={e => setParam('frequence_respiratoire', parseInt(e.target.value))}
                  className={cx(form.parametres?.frequence_respiratoire)} />
              </div>
              <div>
                <label htmlFor="evol-spo2" className="block text-xs text-gray-500 mb-1">SpO2 (%)</label>
                <input id="evol-spo2" type="number"
                  aria-label="Saturation en oxygène"
                  value={form.parametres?.saturation_oxygene || ''}
                  onChange={e => setParam('saturation_oxygene', parseInt(e.target.value))}
                  className={cx(form.parametres?.saturation_oxygene)} />
              </div>
              <div>
                <label htmlFor="evol-ta-g" className="block text-xs text-gray-500 mb-1">TA Gauche</label>
                <input id="evol-ta-g" type="text" placeholder="120/80"
                  value={form.parametres?.tension_arterielle_gauche || ''}
                  onChange={e => setParam('tension_arterielle_gauche', e.target.value)}
                  className={cx(form.parametres?.tension_arterielle_gauche)} />
              </div>
              <div>
                <label htmlFor="evol-ta-d" className="block text-xs text-gray-500 mb-1">TA Droite</label>
                <input id="evol-ta-d" type="text" placeholder="120/80"
                  value={form.parametres?.tension_arterielle_droite || ''}
                  onChange={e => setParam('tension_arterielle_droite', e.target.value)}
                  className={cx(form.parametres?.tension_arterielle_droite)} />
              </div>
              <div>
                <label htmlFor="evol-poids" className="block text-xs text-gray-500 mb-1">Poids (kg)</label>
                <input id="evol-poids" type="number" step="0.1"
                  aria-label="Poids en kilogrammes"
                  value={form.parametres?.poids || ''}
                  onChange={e => setParam('poids', parseFloat(e.target.value))}
                  className={cx(form.parametres?.poids)} />
              </div>
              <div>
                <label htmlFor="evol-diurese" className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3" />Diurèse
                </label>
                <input id="evol-diurese" type="text"
                  value={form.parametres?.diurese || ''}
                  onChange={e => setParam('diurese', e.target.value)}
                  className={cx(form.parametres?.diurese)} />
              </div>
              <div>
                <label htmlFor="evol-tour" className="block text-xs text-gray-500 mb-1">Tour de taille (cm)</label>
                <input id="evol-tour" type="number"
                  aria-label="Tour de taille en centimètres"
                  value={form.parametres?.tour_taille || ''}
                  onChange={e => setParam('tour_taille', parseInt(e.target.value))}
                  className={cx(form.parametres?.tour_taille)} />
              </div>
            </div>
          </div>

          {/* Examen physique central */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Examen physique — Groupe central</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'choc_pointe',           label: 'Choc de pointe'          },
                { key: 'bdc',                   label: 'BDC'                     },
                { key: 'souffles',              label: 'Souffles et bruits'      },
                { key: 'pouls_peripheriques',   label: 'Pouls périphériques'     },
                { key: 'veines_jugulaires',     label: 'Veines jugulaires'       },
                { key: 'appareil_respiratoire', label: 'Appareil respiratoire'   },
                { key: 'foie',                  label: 'Foie'                    },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label htmlFor={`evol-central-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input id={`evol-central-${key}`} type="text"
                    aria-label={label}
                    value={(form.examen_physique_central as Record<string, string> | undefined)?.[key] || ''}
                    onChange={e => setCentral(key, e.target.value)}
                    className={cx((form.examen_physique_central as Record<string, string> | undefined)?.[key])} />
                </div>
              ))}
            </div>
          </div>

          {/* Examen physique périphérique */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Examen physique — Groupe périphérique</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'conjonctives_muqueuses', label: 'Conjonctives et muqueuses' },
                { key: 'etat_bucco_dentaire',    label: 'État bucco-dentaire'       },
                { key: 'masse_cervicale',         label: 'Masse cervicale'          },
                { key: 'abdomen',                 label: 'Abdomen'                  },
                { key: 'masse_palpee',            label: 'Masse palpée'             },
                { key: 'membres_inferieurs_omi',  label: 'Membres inf. (OMI)'       },
                { key: 'mollets',                 label: 'Mollets'                  },
                { key: 'extremites',              label: 'Extrémités'               },
                { key: 'autres',                  label: 'Autres'                   },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label htmlFor={`evol-periph-${key}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input id={`evol-periph-${key}`} type="text"
                    aria-label={label}
                    value={(form.examen_physique_peripherique as Record<string, string> | undefined)?.[key] || ''}
                    onChange={e => setPeriph(key, e.target.value)}
                    className={cx((form.examen_physique_peripherique as Record<string, string> | undefined)?.[key])} />
                </div>
              ))}
            </div>
          </div>

          {/* Résultats paracliniques */}
          <div>
            <label htmlFor="evol-paracliniques" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Résultats des examens paracliniques
            </label>
            <textarea id="evol-paracliniques" rows={3}
              value={form.resultats_examens_paracliniques || ''}
              onChange={e => set('resultats_examens_paracliniques', e.target.value)}
              className={`${cx(form.resultats_examens_paracliniques)} resize-none`} />
          </div>

          {/* Traitement */}
          <div>
            <label htmlFor="evol-traitement" className="block text-xs font-semibold text-gray-600 mb-1.5">Traitement</label>
            <textarea id="evol-traitement" rows={3}
              value={form.traitement || ''}
              onChange={e => set('traitement', e.target.value)}
              className={`${cx(form.traitement)} resize-none`} />
          </div>

          {/* Problèmes posés */}
          <div>
            <label htmlFor="evol-problemes" className="block text-xs font-semibold text-gray-600 mb-1.5">Problèmes posés</label>
            <textarea id="evol-problemes" rows={2}
              value={form.problemes_poses || ''}
              onChange={e => set('problemes_poses', e.target.value)}
              className={`${cx(form.problemes_poses)} resize-none`} />
          </div>

          {/* CAT */}
          <div>
            <label htmlFor="evol-cat" className="block text-xs font-semibold text-gray-600 mb-1.5">CAT</label>
            <textarea id="evol-cat" rows={3}
              value={form.cat || ''}
              onChange={e => set('cat', e.target.value)}
              className={`${cx(form.cat)} resize-none`} />
          </div>

        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-5 py-4 flex justify-between items-center gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all font-medium shadow-md flex items-center gap-2 text-sm disabled:opacity-50">
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><CheckCircle2 className="w-4 h-4" />Enregistrer la mise à jour</>}
          </button>
        </div>
      </div>
    </div>
  );
}