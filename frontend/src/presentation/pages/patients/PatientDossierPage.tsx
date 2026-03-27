// frontend/src/presentation/pages/patients/PatientDossierPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../hooks/useAuth';
import type { Patient } from '../../../core/entities/Patient';
import {
  Phone, FileText, ChevronLeft, Stethoscope, Beaker,
  Heart, Syringe, Pill, FileCheck, Shield, FileArchive, Bed,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { httpClient } from '../../../infrastructure/http/axios.config';

import ObservationsTab      from '../../components/patients/tabs/ObservationsTab';
import BilansBiologiquesTab from '../../components/patients/tabs/BilansBiologiquesTab';
import SoinsMedicauxTab     from '../../components/patients/tabs/SoinsMedicauxTab';
import SoinsInfirmiersTab   from '../../components/patients/tabs/SoinsInfirmiersTab';
import TraitementsTab       from '../../components/patients/tabs/TraitementsTab';
import DocumentsTab         from '../../components/patients/tabs/DocumentsTab';
import ComptesRendusTab     from '../../components/patients/tabs/ComptesRendusTab';
import HospitaliserModal    from '../../components/modals/HospitaliserModal';
import RendreExterneModal   from '../../components/modals/RendreExterneModal';
import TransfererLitModal   from '../../components/patients/modals/TransfererLitModal';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabType =
  | 'observation-medicale' | 'biologie'   | 'soins-medicaux'
  | 'soins-infirmiers'     | 'traitement' | 'document'
  | 'compte-rendu';

interface TabConfig {
  id:           TabType;
  label:        string;
  shortLabel?:  string;
  icon:         LucideIcon;
  rolesAllowed?: string[];
}

interface LitActuel {
  id_lit:     number;
  numero_lit: string;
  categorie:  string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateAge(dateNaissance: string | Date): number {
  const birthDate = typeof dateNaissance === 'string'
    ? new Date(dateNaissance) : dateNaissance;
  if (isNaN(birthDate.getTime())) return 0;
  const today     = new Date();
  let age         = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

// ── Config onglets ────────────────────────────────────────────────────────────

const TABS_CONFIG: TabConfig[] = [
  { id: 'observation-medicale', label: 'Observation médicale', shortLabel: 'Observation', icon: Stethoscope, rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
  { id: 'biologie',             label: 'Biologie',                                         icon: Beaker,      rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
  { id: 'soins-medicaux',       label: 'Soins médicaux',  shortLabel: 'S. Médicaux',       icon: Heart,       rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
  { id: 'soins-infirmiers',     label: 'Soins infirmiers',shortLabel: 'S. Infirmiers',     icon: Syringe,     rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
  { id: 'traitement',           label: 'Traitement',                                        icon: Pill,        rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
  { id: 'document',             label: 'Document',                                          icon: FileText    },
  { id: 'compte-rendu',         label: "Compte Rendu d'Hospitalisation", shortLabel: 'C. Rendu', icon: FileCheck, rolesAllowed: ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export default function PatientDossierPage() {
  const { id }             = useParams<{ id: string }>();
  const navigate           = useNavigate();
  const { getPatientById } = usePatients();
  const { user }           = useAuth();

  const [patient,                setPatient]                = useState<Patient | null>(null);
  const [litActuel,              setLitActuel]              = useState<LitActuel | null>(null);
  const [loading,                setLoading]                = useState(true);
  const [error,                  setError]                  = useState<string | null>(null);
  const [downloadingDossier,     setDownloadingDossier]     = useState(false);
  const [showHospitaliserModal,  setShowHospitaliserModal]  = useState(false);
  const [showRendreExterneModal, setShowRendreExterneModal] = useState(false);
  const [showTransfererLitModal, setShowTransfererLitModal] = useState(false);

  const isHospitalise = patient?.statut_patient === 'hospitalise';
  const isSecretaire  = user?.role === 'secretaire';
  const isMedical     = ['medecin','interne','stagiaire','infirmier'].includes(user?.role ?? '');

  const tabs = useMemo((): TabConfig[] => {
    return TABS_CONFIG.filter(tab => {
      if (tab.id === 'compte-rendu' && !isHospitalise) return false;
      if (tab.rolesAllowed && user?.role) return tab.rolesAllowed.includes(user.role);
      return true;
    });
  }, [isHospitalise, user?.role]);

  const [activeTab, setActiveTab] = useState<TabType>(
    isSecretaire ? 'document' : 'observation-medicale'
  );

  const homePath = useMemo(() => {
    if (isMedical)               return '/doctor';
    if (user?.role === 'secretaire') return '/secretary';
    return '/dashboard';
  }, [isMedical, user?.role]);

  const listPath = useMemo(() => {
    const prefix = isMedical ? '/doctor' : '';
    return isHospitalise
      ? `${prefix}/patients-hospitalises`
      : `${prefix}/patients-externes`;
  }, [isHospitalise, isMedical]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) { setError('ID patient manquant'); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getPatientById(parseInt(id));
        if (cancelled) return;
        if (!data) { setError('Patient non trouvé'); return; }
        setPatient(data);
        if (data.statut_patient === 'hospitalise') await loadLitActuel(parseInt(id));
      } catch {
        if (!cancelled) setError('Erreur lors du chargement du patient');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, getPatientById]);

  const loadLitActuel = async (patientId: number) => {
    try {
      const response = await httpClient.get('/lits');
      const lits: Array<{ id_lit: number; numero_lit: string; categorie: string; statut: string; patient_actuel?: { id_patient: number } }> = response.data;
      const lit = lits.find(l => l.statut === 'occupe' && l.patient_actuel?.id_patient === patientId);
      if (lit) setLitActuel({ id_lit: lit.id_lit, numero_lit: lit.numero_lit, categorie: lit.categorie });
    } catch { /* silencieux */ }
  };

  const handleTransferSuccess = async () => {
    if (!id) return;
    try {
      const data = await getPatientById(parseInt(id));
      if (!data) return;
      setPatient(data);
      if (data.statut_patient === 'hospitalise') await loadLitActuel(parseInt(id));
      else setLitActuel(null);
    } catch { toast.error('Erreur lors du rechargement du patient'); }
  };

  const handleDownloadDossier = async () => {
    if (!patient) return;
    setDownloadingDossier(true);
    try {
      const response = await httpClient.get(`/patients/${patient.id_patient}/dossier-complet/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `dossier_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Dossier téléchargé !');
    } catch { toast.error('Erreur lors du téléchargement'); }
    finally { setDownloadingDossier(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600" />
    </div>
  );

  if (error || !patient) return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <p className="text-xl text-gray-600 mb-4">{error || 'Patient non trouvé'}</p>
      <button onClick={() => navigate(homePath)}
        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all shadow-md">
        Retour au tableau de bord
      </button>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
        <button onClick={() => navigate(homePath)} className="hover:text-cyan-600 transition-colors">Dashboard</button>
        <span>›</span>
        <button onClick={() => navigate(listPath)} className="hover:text-cyan-600 transition-colors">
          {isHospitalise ? 'Patients Hospitalisés' : 'Patients Externes'}
        </button>
        <span>›</span>
        <span className="text-gray-900 font-medium">Dossier Patient</span>
      </div>

      <div className="md:hidden">
        <button onClick={() => navigate(listPath)} className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors">
          <ChevronLeft className="w-5 h-5" /><span className="font-medium">Retour</span>
        </button>
      </div>

      {/* ── Header patient — cyan flat, sans ombrage, sans numéro dossier ── */}
      <div className="bg-cyan-500 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 text-white">

          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Avatar initiales */}
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0 ${isHospitalise ? 'bg-white/20' : 'bg-white/15'}`}>
              {patient.nom_patient?.charAt(0)}{patient.prenom_patient?.charAt(0)}
            </div>

            {/* Infos patient — num_dossier supprimé */}
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm min-w-0">
              <span className="font-bold text-base md:text-lg truncate">
                {patient.nom_patient} {patient.prenom_patient}
              </span>
              <span className="opacity-60">•</span>
              <span>{calculateAge(patient.date_naissance)} ans</span>
              <span className="opacity-60">•</span>
              <span>{patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}</span>

              {isHospitalise && litActuel && (
                <>
                  <span className="opacity-60">•</span>
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                    <Bed className="w-3 h-3" />Lit {litActuel.numero_lit}
                  </span>
                </>
              )}

              <span className="hidden sm:inline opacity-60">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Phone className="w-3 h-3 opacity-70" />{patient.tel_patient || 'Non renseigné'}
              </span>

              <span className="hidden sm:inline opacity-60">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Shield className="w-3 h-3 opacity-70" />{patient.assurance || 'Aucune'}
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={handleDownloadDossier} disabled={downloadingDossier}
              className="hidden md:flex px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all text-sm font-medium items-center gap-2 disabled:opacity-50 whitespace-nowrap border border-white/20">
              {downloadingDossier
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Téléchargement...</>
                : <><FileArchive className="w-4 h-4" />Tout télécharger</>}
            </button>

            {/* Actions médicales — masquées pour le secrétaire */}
            {!isSecretaire && (
              <>
                {isHospitalise && litActuel && (
                  <button onClick={() => setShowTransfererLitModal(true)}
                    className="hidden md:flex px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all text-sm font-medium items-center gap-2 whitespace-nowrap border border-white/20">
                    <Bed className="w-4 h-4" />Changer de lit
                  </button>
                )}
                {patient.statut_patient === 'externe' ? (
                  <button onClick={() => setShowHospitaliserModal(true)}
                    className="px-3 md:px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors text-sm font-medium whitespace-nowrap border border-white/20">
                    Hospitaliser
                  </button>
                ) : (
                  <button onClick={() => setShowRendreExterneModal(true)}
                    className="px-3 md:px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors text-sm font-medium whitespace-nowrap border border-white/20">
                    Rendre externe
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message informatif secrétaire */}
      {isSecretaire && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3 text-sm text-cyan-700 flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          Accès limité — vous pouvez consulter et gérer les documents du patient.
          Les données médicales sont réservées au personnel soignant.
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">

          {/* Mobile */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {tabs.map(tab => {
                const Icon = tab.icon; const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${isActive ? 'text-cyan-600 bg-cyan-50' : 'text-gray-600 hover:text-cyan-500 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{tab.shortLabel || tab.label}</span>
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full">
            {tabs.map(tab => {
              const Icon = tab.icon; const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-6 py-3 transition-all flex-1 ${isActive ? 'text-cyan-600 bg-cyan-50' : 'text-gray-600 hover:text-cyan-500 hover:bg-gray-50'}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm lg:text-base font-medium">
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.shortLabel || tab.label}</span>
                  </span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === 'observation-medicale' && <ObservationsTab      patient={patient} />}
          {activeTab === 'biologie'             && <BilansBiologiquesTab patient={patient} />}
          {activeTab === 'soins-medicaux'       && <SoinsMedicauxTab     patient={patient} />}
          {activeTab === 'soins-infirmiers'     && <SoinsInfirmiersTab   patient={patient} />}
          {activeTab === 'traitement'           && <TraitementsTab        patient={patient} />}
          {activeTab === 'document'             && <DocumentsTab          patient={patient} />}
          {activeTab === 'compte-rendu'         && <ComptesRendusTab      patient={patient} />}
        </div>
      </div>

      {/* Modals */}
      {showHospitaliserModal && (
        <HospitaliserModal patient={patient}
          onClose={() => setShowHospitaliserModal(false)}
          onSuccess={handleTransferSuccess} />
      )}
      {showRendreExterneModal && (
        <RendreExterneModal patient={patient}
          onClose={() => setShowRendreExterneModal(false)}
          onSuccess={handleTransferSuccess} />
      )}
      {showTransfererLitModal && litActuel && (
        <TransfererLitModal patient={patient} litActuel={litActuel}
          onClose={() => setShowTransfererLitModal(false)}
          onSuccess={handleTransferSuccess} />
      )}
    </div>
  );
}