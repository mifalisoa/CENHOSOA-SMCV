import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import type { Patient } from '../../../core/entities/Patient';
import { 
  User, 
  Phone, 
  Calendar,
  FileText,
  ChevronLeft,
  Stethoscope,
  Beaker,
  Heart,
  Syringe,
  Pill,
  FileCheck,
  Shield,
  FileArchive
} from 'lucide-react';
import { toast } from 'sonner';
import { httpClient } from '../../../infrastructure/http/axios.config';

// Import des onglets
import ObservationsTab from '../../components/patients/tabs/ObservationsTab';
import BilansBiologiquesTab from '../../components/patients/tabs/BilansBiologiquesTab';
import SoinsMedicauxTab from '../../components/patients/tabs/SoinsMedicauxTab';
import SoinsInfirmiersTab from '../../components/patients/tabs/SoinsInfirmiersTab';
import TraitementsTab from '../../components/patients/tabs/TraitementsTab';
import DocumentsTab from '../../components/patients/tabs/DocumentsTab';
import ComptesRendusTab from '../../components/patients/tabs/ComptesRendusTab';

// Import des modals de transfert
import HospitaliserModal from "../../components/modals/HospitaliserModal";
import RendreExterneModal from "../../components/modals/RendreExterneModal";

type TabType =
  | 'observation-medicale'
  | 'biologie'
  | 'soins-medicaux'
  | 'soins-infirmiers'
  | 'traitement'
  | 'document'
  | 'compte-rendu';

interface TabConfig {
  id: TabType;
  label: string;
  shortLabel?: string;
  icon: typeof Stethoscope;
}

export default function PatientDossierPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById } = usePatients();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('observation-medicale');
  const [downloadingDossier, setDownloadingDossier] = useState(false);
  const [showHospitaliserModal, setShowHospitaliserModal] = useState(false);
  const [showRendreExterneModal, setShowRendreExterneModal] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) {
        setError('ID patient manquant');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPatientById(parseInt(id));

        if (data) {
          setPatient(data);
        } else {
          setError('Patient non trouvé');
        }
      } catch (error) {
        console.error('Erreur chargement patient:', error);
        setError('Erreur lors du chargement du patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, getPatientById]);

  // Télécharger tout le dossier patient en ZIP
  const handleDownloadAllDossier = async () => {
    if (!patient) return;

    setDownloadingDossier(true);
    try {
      const response = await httpClient.get(`/patients/${patient.id_patient}/dossier-complet/zip`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dossier_complet_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Dossier complet téléchargé !');
    } catch (err) {
      console.error('Erreur téléchargement dossier:', err);
      toast.error('Erreur lors du téléchargement du dossier');
    } finally {
      setDownloadingDossier(false);
    }
  };

  // Rafraîchir les données du patient après un transfert
  const handleTransferSuccess = async () => {
    if (!id) return;
    
    try {
      const data = await getPatientById(parseInt(id));
      if (data) {
        setPatient(data);
      }
    } catch (error) {
      console.error('Erreur rechargement patient:', error);
    }
  };

  const calculateAge = (dateNaissance: string | Date) => {
    const today = new Date();
    const birthDate = typeof dateNaissance === 'string' ? new Date(dateNaissance) : dateNaissance;
    if (isNaN(birthDate.getTime())) return 0;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getTabs = (): TabConfig[] => {
    const baseTabs: TabConfig[] = [
      { id: 'observation-medicale', label: 'Observation médicale', shortLabel: 'Observation', icon: Stethoscope },
      { id: 'biologie', label: 'Biologie', icon: Beaker },
      { id: 'soins-medicaux', label: 'Soins médicaux', shortLabel: 'S. Médicaux', icon: Heart },
      { id: 'soins-infirmiers', label: 'Soins infirmiers', shortLabel: 'S. Infirmiers', icon: Syringe },
      { id: 'traitement', label: 'Traitement', icon: Pill },
      { id: 'document', label: 'Document', icon: FileText },
    ];

    if (patient?.statut_patient === 'hospitalisé' || patient?.statut_patient === 'hospitalise') {
      baseTabs.push({
        id: 'compte-rendu',
        label: "Compte Rendu d'Hospitalisation",
        shortLabel: 'C. Rendu',
        icon: FileCheck,
      });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-xl text-gray-600 mb-4">
          {error || 'Patient non trouvé'}
        </p>
        <button
          onClick={() => navigate('/patients-externes')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md"
        >
          Retour aux patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-blue-600 transition-colors"
        >
          Dashboard
        </button>
        <span>›</span>
        <button
          onClick={() => navigate((patient.statut_patient === 'hospitalisé' || patient.statut_patient === 'hospitalise') ? '/patients-hospitalises' : '/patients-externes')}
          className="hover:text-blue-600 transition-colors"
        >
          {(patient.statut_patient === 'hospitalisé' || patient.statut_patient === 'hospitalise') ? 'Patients Hospitalisés' : 'Patients Externes'}
        </button>
        <span>›</span>
        <span className="text-gray-900 font-medium">Dossier Patient</span>
      </div>

      {/* Mobile Back Button */}
      <div className="md:hidden">
        <button
          onClick={() => navigate((patient.statut_patient === 'hospitalisé' || patient.statut_patient === 'hospitalise') ? '/patients-hospitalises' : '/patients-externes')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      {/* Header - TOUT SUR UNE LIGNE */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 text-white">
          {/* Nom + Infos */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0 ${
              (patient.statut_patient === 'hospitalisé' || patient.statut_patient === 'hospitalise')
                ? 'bg-gradient-to-br from-red-500 to-orange-600' 
                : 'bg-white/20'
            }`}>
              {patient.nom_patient?.charAt(0)}
              {patient.prenom_patient?.charAt(0)}
            </div>

            {/* Toutes les infos en ligne */}
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm min-w-0">
              <span className="font-bold text-base md:text-lg truncate">
                {patient.nom_patient} {patient.prenom_patient}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {calculateAge(patient.date_naissance)} ans
              </span>
              <span>•</span>
              <span>{patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}</span>
              <span>•</span>
              <span>{patient.num_dossier}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {patient.tel_patient || 'Non renseigné'}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {patient.assurance || 'Aucune'}
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 flex-shrink-0">
            {/* Bouton ZIP global */}
            <button 
              onClick={handleDownloadAllDossier}
              disabled={downloadingDossier}
              className="hidden md:flex px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-sm font-medium shadow-md items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {downloadingDossier ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Téléchargement...
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  Tout télécharger
                </>
              )}
            </button>

            {/* Bouton ZIP mobile */}
            <button 
              onClick={handleDownloadAllDossier}
              disabled={downloadingDossier}
              className="md:hidden p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-md disabled:opacity-50"
              title="Tout télécharger"
            >
              {downloadingDossier ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FileArchive className="w-4 h-4" />
              )}
            </button>

            {/* Bouton statut */}
            {patient.statut_patient === 'externe' ? (
              <button 
                onClick={() => setShowHospitaliserModal(true)}
                className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                Hospitaliser
              </button>
            ) : (
              <button 
                onClick={() => setShowRendreExterneModal(true)}
                className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                Rendre externe
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          {/* Mobile & Tablet : Scroll horizontal */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600 bg-gradient-to-b from-cyan-50 to-blue-50'
                        : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                      {tab.shortLabel || tab.label}
                    </span>
                    
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-6 py-3 transition-all flex-1 ${
                    isActive
                      ? 'text-blue-600 bg-gradient-to-b from-cyan-50 to-blue-50'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm lg:text-base font-medium">
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.shortLabel || tab.label}</span>
                  </span>
                  
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === 'observation-medicale' && <ObservationsTab patient={patient} />}
          {activeTab === 'biologie' && <BilansBiologiquesTab patient={patient} />}
          {activeTab === 'soins-medicaux' && <SoinsMedicauxTab patient={patient} />}
          {activeTab === 'soins-infirmiers' && <SoinsInfirmiersTab patient={patient} />}
          {activeTab === 'traitement' && <TraitementsTab patient={patient} />}
          {activeTab === 'document' && <DocumentsTab patient={patient} />}
          {activeTab === 'compte-rendu' && <ComptesRendusTab patient={patient} />}
        </div>
      </div>

      {/* Modals de transfert */}
      {showHospitaliserModal && (
        <HospitaliserModal
          patient={patient}
          onClose={() => setShowHospitaliserModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {showRendreExterneModal && (
        <RendreExterneModal
          patient={patient}
          onClose={() => setShowRendreExterneModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
}