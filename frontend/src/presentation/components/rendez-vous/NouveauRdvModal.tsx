// frontend/src/presentation/components/rendez-vous/NouveauRdvModal.tsx

import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  User, 
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Lock
} from 'lucide-react';
import { useRendezVous } from '../../hooks/useRendezVous';
import { httpClient } from '../../../infrastructure/http/axios.config';
import type { CreateRendezVousDTO } from '../../../core/entities/RendezVous';
import type { Patient } from '../../../core/entities/Patient';

interface NouveauRdvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  datePreselection?: string;
  heurePreselection?: string;
  docteurPreselection?: number;
  patientPreselection?: number;
}

interface Docteur {
  id_user: number;
  nom: string;
  prenom: string;
  specialite: string;
}

const Spinner = () => (
  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
);

const CRENEAUX_FIXES = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export default function NouveauRdvModal({
  isOpen,
  onClose,
  onSuccess,
  datePreselection,
  heurePreselection,
  docteurPreselection,
  patientPreselection,
}: NouveauRdvModalProps) {
  const { createRendezVous, getAvailableSlots } = useRendezVous();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchPatient, setSearchPatient] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  const [docteurs, setDocteurs] = useState<Docteur[]>([]);
  const [creneauxDisponibles, setCreneauxDisponibles] = useState<string[]>([]);
  const [loadingCreneaux, setLoadingCreneaux] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateRendezVousDTO>>({
    id_patient: patientPreselection || undefined,
    id_docteur: docteurPreselection || undefined,
    date_rdv: datePreselection || new Date().toISOString().split('T')[0],
    heure_rdv: heurePreselection || '',
    type_rdv: 'consultation',
    duree_estimee: 30,
    statut_rdv: 'planifie',
    motif_rdv: ''
  });

  const [patientSelectionne, setPatientSelectionne] = useState<Patient | null>(null);

  useEffect(() => {
    if (!patientPreselection || !isOpen) return;
    const fetchPatientInfo = async () => {
      try {
        const response = await httpClient.get(`/patients/${patientPreselection}`);
        const p: Patient = response.data.data ?? response.data;
        setPatientSelectionne(p);
        setFormData(prev => ({ ...prev, id_patient: p.id_patient }));
      } catch {
        setFormData(prev => ({ ...prev, id_patient: patientPreselection }));
      }
    };
    fetchPatientInfo();
  }, [patientPreselection, isOpen]);

  const loadDocteurs = async () => {
    try {
      const response = await httpClient.get('/utilisateurs', {
        params: { role: 'medecin', statut: 'actif' }
      });
      const raw = response.data.data || response.data || [];
      const mapped = Array.isArray(raw)
        ? raw.map((u: { id_utilisateur?: number; id_user?: number; nom: string; prenom: string; specialite?: string }) => ({
            id_user:    u.id_utilisateur ?? u.id_user ?? 0,
            nom:        u.nom,
            prenom:     u.prenom,
            specialite: u.specialite ?? 'Médecin',
          }))
        : [];
      setDocteurs(mapped);
    } catch {
      setDocteurs([
        { id_user: 1, nom: 'ANDRY', prenom: 'Dr', specialite: 'Cardiologue Senior' },
        { id_user: 2, nom: 'RABE', prenom: 'Dr', specialite: 'Cardiologue' },
        { id_user: 3, nom: 'SOLO', prenom: 'Dr', specialite: 'Cardio-pédiatre' },
        { id_user: 4, nom: 'RABE (Interne)', prenom: 'Dr', specialite: 'Interne Cardiologie' },
      ]);
    }
  };

  const loadCreneauxDisponibles = useCallback(async () => {
    if (!formData.id_docteur || !formData.date_rdv) return;
    try {
      setLoadingCreneaux(true);
      const creneaux = await getAvailableSlots(
        formData.id_docteur,
        formData.date_rdv,
        '08:00',
        '18:00'
      );
      setCreneauxDisponibles(creneaux && creneaux.length > 0 ? creneaux : CRENEAUX_FIXES);
    } catch {
      setCreneauxDisponibles(CRENEAUX_FIXES);
    } finally {
      setLoadingCreneaux(false);
    }
  }, [formData.id_docteur, formData.date_rdv, getAvailableSlots]);

  useEffect(() => {
    if (isOpen) loadDocteurs();
  }, [isOpen]);

  useEffect(() => {
    if (formData.id_docteur && formData.date_rdv) {
      loadCreneauxDisponibles();
    }
  }, [formData.id_docteur, formData.date_rdv, loadCreneauxDisponibles]);

  useEffect(() => {
    if (patientPreselection) return;
    if (searchPatient.length >= 2) {
      const timer = setTimeout(() => searchPatients(searchPatient), 300);
      return () => clearTimeout(timer);
    } else {
      setPatients([]);
      setShowPatientDropdown(false);
    }
  }, [searchPatient, patientPreselection]);

  const searchPatients = async (query: string) => {
    try {
      setSearchingPatients(true);
      const response = await httpClient.get('/patients', {
        params: { search: query, limit: 10 }
      });
      setPatients(response.data.data || response.data || []);
      setShowPatientDropdown(true);
    } catch {
      setPatients([]);
    } finally {
      setSearchingPatients(false);
    }
  };

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

    setLoading(true);
    setError(null);

    try {
      await createRendezVous(formData as CreateRendezVousDTO);
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_patient: patientPreselection || undefined,
      id_docteur: docteurPreselection || undefined,
      date_rdv: datePreselection || new Date().toISOString().split('T')[0],
      heure_rdv: heurePreselection || '',
      type_rdv: 'consultation',
      duree_estimee: 30,
      statut_rdv: 'planifie',
      motif_rdv: ''
    });
    if (!patientPreselection) {
      setPatientSelectionne(null);
      setSearchPatient('');
    }
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-100">

        <div className="bg-gradient-to-r from-cyan-600 to-sky-700 p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Nouveau Rendez-vous</h2>
                <p className="text-cyan-100 text-sm font-medium opacity-90">
                  {patientSelectionne
                    ? `${patientSelectionne.nom_patient} ${patientSelectionne.prenom_patient}`
                    : 'Planifier une consultation'
                  }
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-2 transition-colors" aria-label="Fermer" title="Fermer la fenêtre">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded-r-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="space-y-2">
            <label htmlFor="search-patient" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="w-4 h-4 text-cyan-600" />
              Patient <span className="text-red-500">*</span>
            </label>

            {patientPreselection ? (
              <div className="p-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg flex items-center gap-3">
                <Lock className="w-4 h-4 text-cyan-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-cyan-800 truncate">
                    {patientSelectionne
                      ? `${patientSelectionne.nom_patient} ${patientSelectionne.prenom_patient}`
                      : 'Chargement...'
                    }
                  </p>
                  <p className="text-xs text-cyan-600">
                    {patientSelectionne?.num_dossier && `Dossier : ${patientSelectionne.num_dossier} · `}
                    Patient pré-sélectionné
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="search-patient"
                    type="text"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    placeholder="Rechercher un patient (nom, prénom, dossier)..."
                    className="w-full pl-10 pr-4 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  {searchingPatients && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2"><Spinner /></div>
                  )}
                </div>

                {showPatientDropdown && patients.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {patients.map(patient => (
                      <button key={patient.id_patient} type="button" onClick={() => selectPatient(patient)}
                        className="w-full px-4 py-3 hover:bg-cyan-50 transition-colors text-left flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{patient.nom_patient} {patient.prenom_patient}</p>
                          <p className="text-xs text-gray-500">Dossier: {patient.num_dossier} • {patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                      </button>
                    ))}
                  </div>
                )}

                {patientSelectionne && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{patientSelectionne.nom_patient} {patientSelectionne.prenom_patient}</p>
                      <p className="text-xs text-green-600">Dossier: {patientSelectionne.num_dossier}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="select-medecin" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Médecin <span className="text-red-500">*</span>
            </label>
            <select id="select-medecin" value={formData.id_docteur || ''} onChange={(e) => handleChange('id_docteur', parseInt(e.target.value))} required
              className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="">Sélectionner un médecin...</option>
              {Array.isArray(docteurs) && docteurs.map(doc => (
                <option key={doc.id_user} value={doc.id_user}>Dr. {doc.nom} - {doc.specialite}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="input-date" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Date <span className="text-red-500">*</span>
              </label>
              <input id="input-date" type="date" value={formData.date_rdv} onChange={(e) => handleChange('date_rdv', e.target.value)}
                required aria-label="Date du rendez-vous"
                className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label htmlFor="select-heure" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-cyan-600" />
                Heure <span className="text-red-500">*</span>
              </label>
              <select id="select-heure" value={formData.heure_rdv} onChange={(e) => handleChange('heure_rdv', e.target.value)}
                required disabled={!formData.id_docteur || !formData.date_rdv}
                className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none disabled:opacity-50">
                <option value="">Sélectionner une heure...</option>
                {loadingCreneaux ? (
                  <option>Chargement...</option>
                ) : creneauxDisponibles.length > 0 ? (
                  creneauxDisponibles.map(creneau => (
                    <option key={creneau} value={creneau}>{creneau}</option>
                  ))
                ) : (
                  <option disabled>Aucun créneau disponible</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="select-type" className="text-sm font-semibold text-slate-700">Type de RDV</label>
              <select id="select-type" value={formData.type_rdv} onChange={(e) => handleChange('type_rdv', e.target.value)}
                className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="consultation">Consultation</option>
                <option value="controle">Contrôle</option>
                <option value="urgence">Urgence</option>
                <option value="suivi">Suivi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="select-duree" className="text-sm font-semibold text-slate-700">Durée estimée</label>
              <select id="select-duree" value={formData.duree_estimee} onChange={(e) => handleChange('duree_estimee', parseInt(e.target.value))}
                className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="textarea-motif" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-cyan-600" />
              Motif de consultation <span className="text-red-500">*</span>
            </label>
            <textarea id="textarea-motif" value={formData.motif_rdv} onChange={(e) => handleChange('motif_rdv', e.target.value)}
              required rows={3} placeholder="Ex: Consultation de suivi, douleurs thoraciques, contrôle post-opératoire..."
              className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none" />
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all">
              {loading ? <Spinner /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{loading ? 'Création...' : 'Créer le rendez-vous'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}