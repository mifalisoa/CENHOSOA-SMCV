import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import type { Patient } from '../../../core/entities/Patient';
import { 
  User, 
  Phone, 
  Droplet, 
  Ruler, 
  Weight, 
  Calendar,
  FileText,
  ChevronLeft,
  Stethoscope,
  Beaker,
  Heart,
  Syringe,
  Pill,
  FileCheck
} from 'lucide-react';

// Import des onglets
import ObservationsTab from '../../components/patients/tabs/ObservationsTab';
import BilansBiologiquesTab from '../../components/patients/tabs/BilansBiologiquesTab';
import SoinsMedicauxTab from '../../components/patients/tabs/SoinsMedicauxTab';
import SoinsInfirmiersTab from '../../components/patients/tabs/SoinsInfirmiersTab';
import TraitementsTab from '../../components/patients/tabs/TraitementsTab';
import DocumentsTab from '../../components/patients/tabs/DocumentsTab';
import ComptesRendusTab from '../../components/patients/tabs/ComptesRendusTab';

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

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
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

  const tabs: TabConfig[] = [
    { id: 'observation-medicale', label: 'Observation médicale', shortLabel: 'Observation', icon: Stethoscope },
    { id: 'biologie', label: 'Biologie', icon: Beaker },
    { id: 'soins-medicaux', label: 'Soins médicaux', shortLabel: 'S. Médicaux', icon: Heart },
    { id: 'soins-infirmiers', label: 'Soins infirmiers', shortLabel: 'S. Infirmiers', icon: Syringe },
    { id: 'traitement', label: 'Traitement', icon: Pill },
    { id: 'document', label: 'Document', icon: FileText },
  ];

  if (patient?.statut_patient === 'hospitalise') {
    tabs.push({
      id: 'compte-rendu',
      label: 'Compte Rendu',
      shortLabel: 'C. Rendu',
      icon: FileCheck,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
          onClick={() => navigate('/patients-externes')}
          className="hover:text-blue-600 transition-colors"
        >
          Patients
        </button>
        <span>›</span>
        <span className="text-gray-900 font-medium">Dossier Patient</span>
      </div>

      {/* Mobile Back Button */}
      <div className="md:hidden">
        <button
          onClick={() => navigate('/patients-externes')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      {/* Header - Même gradient que sidebar admin */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center text-lg md:text-2xl font-bold flex-shrink-0">
              {patient.nom_patient?.charAt(0)}
              {patient.prenom_patient?.charAt(0)}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {patient.nom_patient} {patient.prenom_patient}
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  {calculateAge(patient.date_naissance)} ans
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  {patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 md:w-4 md:h-4" />
                  {patient.num_dossier}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {patient.statut_patient === 'externe' && (
            <button className="w-full md:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap">
              Hospitaliser
            </button>
          )}
        </div>
      </div>

      {/* Infos Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <InfoCard
          icon={<Phone className="w-5 h-5 md:w-6 md:h-6" />}
          label="Téléphone"
          value={patient.tel_patient || 'Non renseigné'}
        />
        <InfoCard
          icon={<Droplet className="w-5 h-5 md:w-6 md:h-6" />}
          label="Groupe sanguin"
          value={patient.groupe_sanguin || 'Inconnu'}
        />
        <InfoCard
          icon={<Ruler className="w-5 h-5 md:w-6 md:h-6" />}
          label="Taille"
          value={
            patient.taille_patient
              ? `${patient.taille_patient} cm`
              : '-'
          }
        />
        <InfoCard
          icon={<Weight className="w-5 h-5 md:w-6 md:h-6" />}
          label="Poids"
          value={
            patient.poids_patient
              ? `${patient.poids_patient} kg`
              : '-'
          }
        />
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Tabs Header - Scroll horizontal sur mobile, flex sur desktop */}
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
                    title={tab.label}
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                      {tab.shortLabel || tab.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop : Flex avec flex-1 pour remplir tout l'espace */}
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
                  title={tab.label}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm lg:text-base font-medium">
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.shortLabel || tab.label}</span>
                  </span>
                  
                  {/* Active indicator */}
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
          {activeTab === 'observation-medicale' && (
            <ObservationsTab patient={patient} />
          )}
          {activeTab === 'biologie' && (
            <BilansBiologiquesTab patient={patient} />
          )}
          {activeTab === 'soins-medicaux' && (
            <SoinsMedicauxTab patient={patient} />
          )}
          {activeTab === 'soins-infirmiers' && (
            <SoinsInfirmiersTab patient={patient} />
          )}
          {activeTab === 'traitement' && (
            <TraitementsTab patient={patient} />
          )}
          {activeTab === 'document' && (
            <DocumentsTab patient={patient} />
          )}
          {activeTab === 'compte-rendu' && (
            <ComptesRendusTab patient={patient} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="text-blue-600 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}