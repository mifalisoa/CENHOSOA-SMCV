// frontend/src/presentation/components/rendez-vous/NouveauRdvModal.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  X, User, Calendar, Clock, FileText, Stethoscope,
  AlertCircle, CheckCircle2, Loader2, Search, Lock,
} from 'lucide-react';
import { useRendezVous }  from '../../hooks/useRendezVous';
import { httpClient }     from '../../../infrastructure/http/axios.config';
import type { CreateRendezVousDTO } from '../../../core/entities/RendezVous';
import type { Patient }   from '../../../core/entities/Patient';

interface NouveauRdvModalProps {
  isOpen:                boolean;
  onClose:               () => void;
  onSuccess:             () => void;
  datePreselection?:     string;
  heurePreselection?:    string;
  docteurPreselection?:  number;
  patientPreselection?:  number;
}

interface Docteur { id_user: number; nom: string; prenom: string; specialite: string; }

const Spinner = () => <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />;

const CRENEAUX_FIXES = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export default function NouveauRdvModal({
  isOpen, onClose, onSuccess,
  datePreselection, heurePreselection, docteurPreselection, patientPreselection,
}: NouveauRdvModalProps) {
  const { createRendezVous, getAvailableSlots } = useRendezVous();

  const [loading,              setLoading]              = useState(false);
  const [error,                setError]                = useState<string | null>(null);
  const [searchPatient,        setSearchPatient]        = useState('');
  const [patients,             setPatients]             = useState<Patient[]>([]);
  const [searchingPatients,    setSearchingPatients]    = useState(false);
  const [showPatientDropdown,  setShowPatientDropdown]  = useState(false);
  const [docteurs,             setDocteurs]             = useState<Docteur[]>([]);
  const [creneauxDisponibles,  setCreneauxDisponibles]  = useState<string[]>([]);
  const [loadingCreneaux,      setLoadingCreneaux]      = useState(false);
  const [patientSelectionne,   setPatientSelectionne]   = useState<Patient | null>(null);

  const [formData, setFormData] = useState<Partial<CreateRendezVousDTO>>({
    id_patient:    patientPreselection || undefined,
    id_docteur:    docteurPreselection || undefined,
    date_rdv:      datePreselection   || new Date().toISOString().split('T')[0],
    heure_rdv:     heurePreselection  || '',
    type_rdv:      'consultation',
    duree_estimee: 30,
    statut_rdv:    'planifie',
    motif_rdv:     '',
  });

  // Charge le patient pré-sélectionné
  useEffect(() => {
    if (!patientPreselection || !isOpen) return;
    httpClient.get(`/patients/${patientPreselection}`)
      .then(res => {
        const p: Patient = res.data.data ?? res.data;
        setPatientSelectionne(p);
        setFormData(prev => ({ ...prev, id_patient: p.id_patient }));
      })
      .catch(() => setFormData(prev => ({ ...prev, id_patient: patientPreselection })));
  }, [patientPreselection, isOpen]);

  const loadDocteurs = async () => {
    try {
      const response = await httpClient.get('/utilisateurs', { params: { role: 'medecin', statut: 'actif' } });
      const raw = response.data.data || response.data || [];
      const mapped = Array.isArray(raw) ? raw.map((u: { id_utilisateur?: number; id_user?: number; nom: string; prenom: string; specialite?: string }) => ({
        id_user: u.id_utilisateur ?? u.id_user ?? 0,
        nom: u.nom, prenom: u.prenom, specialite: u.specialite ?? 'Médecin',
      })) : [];
      setDocteurs(mapped);
    } catch {
      setDocteurs([]);
    }
  };

  const loadCreneaux = useCallback(async () => {
    if (!formData.id_docteur || !formData.date_rdv) return;
    try {
      setLoadingCreneaux(true);
      const creneaux = await getAvailableSlots(formData.id_docteur, formData.date_rdv, '08:00', '18:00');
      setCreneauxDisponibles(creneaux?.length > 0 ? creneaux : CRENEAUX_FIXES);
    } catch { setCreneauxDisponibles(CRENEAUX_FIXES); }
    finally { setLoadingCreneaux(false); }
  }, [formData.id_docteur, formData.date_rdv, getAvailableSlots]);

  useEffect(() => { if (isOpen) loadDocteurs(); }, [isOpen]);
  useEffect(() => { if (formData.id_docteur && formData.date_rdv) loadCreneaux(); }, [formData.id_docteur, formData.date_rdv, loadCreneaux]);

  useEffect(() => {
    if (patientPreselection) return;
    if (searchPatient.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          setSearchingPatients(true);
          const res = await httpClient.get('/patients', { params: { search: searchPatient, limit: 10 } });
          setPatients(res.data.data || res.data || []);
          setShowPatientDropdown(true);
        } catch { setPatients([]); }
        finally { setSearchingPatients(false); }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPatients([]); setShowPatientDropdown(false);
    }
  }, [searchPatient, patientPreselection]);

  const selectPatient = (patient: Patient) => {
    setPatientSelectionne(patient);
    setFormData(prev => ({ ...prev, id_patient: patient.id_patient }));
    setSearchPatient(`${patient.nom_patient} ${patient.prenom_patient}`);
    setShowPatientDropdown(false);
  };

  const handleChange = (field: keyof CreateRendezVousDTO, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_patient) { setError('Veuillez sélectionner un patient'); return; }
    if (!formData.id_docteur) { setError('Veuillez sélectionner un médecin'); return; }
    if (!formData.date_rdv)   { setError('Veuillez sélectionner une date'); return; }
    if (!formData.heure_rdv)  { setError('Veuillez sélectionner une heure'); return; }
    if (!formData.motif_rdv?.trim()) { setError('Veuillez saisir un motif'); return; }
    setLoading(true); setError(null);
    try {
      await createRendezVous(formData as CreateRendezVousDTO);
      onSuccess(); onClose();
      setFormData({ id_patient: patientPreselection || undefined, id_docteur: docteurPreselection || undefined,
        date_rdv: datePreselection || new Date().toISOString().split('T')[0],
        heure_rdv: heurePreselection || '', type_rdv: 'consultation',
        duree_estimee: 30, statut_rdv: 'planifie', motif_rdv: '' });
      if (!patientPreselection) { setPatientSelectionne(null); setSearchPatient(''); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputCls = 'w-full px-3 py-2.5 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm';
  const labelCls = 'flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-0 sm:border border-cyan-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-sky-700 p-4 sm:p-6 text-white sticky top-0 z-10 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Nouveau Rendez-vous</h2>
                <p className="text-cyan-100 text-xs sm:text-sm opacity-90">
                  {patientSelectionne
                    ? `${patientSelectionne.nom_patient} ${patientSelectionne.prenom_patient}`
                    : 'Planifier une consultation'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-3 rounded-r-lg">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Patient */}
          <div>
            <label className={labelCls}>
              <User className="w-4 h-4 text-cyan-600" />
              Patient <span className="text-red-500">*</span>
            </label>
            {patientPreselection ? (
              <div className="p-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg flex items-center gap-3">
                <Lock className="w-4 h-4 text-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-cyan-800 truncate">
                    {patientSelectionne ? `${patientSelectionne.nom_patient} ${patientSelectionne.prenom_patient}` : 'Chargement...'}
                  </p>
                  <p className="text-xs text-cyan-600">Patient pré-sélectionné</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchPatient} onChange={e => setSearchPatient(e.target.value)}
                    placeholder="Rechercher un patient..."
                    className="w-full pl-10 pr-4 py-2.5 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm" />
                  {searchingPatients && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>}
                </div>
                {showPatientDropdown && patients.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {patients.map(patient => (
                      <button key={patient.id_patient} type="button" onClick={() => selectPatient(patient)}
                        className="w-full px-4 py-3 hover:bg-cyan-50 text-left flex items-center justify-between border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{patient.nom_patient} {patient.prenom_patient}</p>
                          <p className="text-xs text-gray-500">Dossier : {patient.num_dossier}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {patientSelectionne && (
                  <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-sm font-semibold text-green-800">{patientSelectionne.nom_patient} {patientSelectionne.prenom_patient}</p>
                    <p className="text-xs text-green-600 ml-auto">#{patientSelectionne.num_dossier}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Médecin */}
          <div>
            <label htmlFor="select-medecin" className={labelCls}>
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Médecin <span className="text-red-500">*</span>
            </label>
            <select id="select-medecin" value={formData.id_docteur || ''} onChange={e => handleChange('id_docteur', parseInt(e.target.value))} required className={inputCls}>
              <option value="">Sélectionner un médecin...</option>
              {docteurs.map(doc => <option key={doc.id_user} value={doc.id_user}>Dr. {doc.nom} — {doc.specialite}</option>)}
            </select>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-date" className={labelCls}>
                <Calendar className="w-4 h-4 text-cyan-600" />
                Date <span className="text-red-500">*</span>
              </label>
              <input id="input-date" type="date" value={formData.date_rdv} onChange={e => handleChange('date_rdv', e.target.value)}
                required aria-label="Date du rendez-vous" className={inputCls} />
            </div>
            <div>
              <label htmlFor="select-heure" className={labelCls}>
                <Clock className="w-4 h-4 text-cyan-600" />
                Heure <span className="text-red-500">*</span>
              </label>
              <select id="select-heure" value={formData.heure_rdv} onChange={e => handleChange('heure_rdv', e.target.value)}
                required disabled={!formData.id_docteur || !formData.date_rdv}
                className={`${inputCls} disabled:opacity-50`}>
                <option value="">Heure...</option>
                {loadingCreneaux ? <option>Chargement...</option> :
                  creneauxDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Type + Durée */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-type" className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
              <select id="select-type" value={formData.type_rdv} onChange={e => handleChange('type_rdv', e.target.value)} className={inputCls}>
                <option value="consultation">Consultation</option>
                <option value="controle">Contrôle</option>
                <option value="urgence">Urgence</option>
                <option value="suivi">Suivi</option>
              </select>
            </div>
            <div>
              <label htmlFor="select-duree" className="block text-sm font-semibold text-slate-700 mb-1.5">Durée</label>
              <select id="select-duree" value={formData.duree_estimee} onChange={e => handleChange('duree_estimee', parseInt(e.target.value))} className={inputCls}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 heure</option>
              </select>
            </div>
          </div>

          {/* Motif */}
          <div>
            <label htmlFor="textarea-motif" className={labelCls}>
              <FileText className="w-4 h-4 text-cyan-600" />
              Motif <span className="text-red-500">*</span>
            </label>
            <textarea id="textarea-motif" value={formData.motif_rdv} onChange={e => handleChange('motif_rdv', e.target.value)}
              required rows={3} placeholder="Ex: Consultation de suivi, douleurs thoraciques..."
              className={`${inputCls} resize-none`} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm border border-gray-200">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
              {loading ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'Création...' : 'Créer le rendez-vous'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}