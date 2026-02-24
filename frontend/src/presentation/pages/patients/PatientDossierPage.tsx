import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import type { Patient } from '../../../core/entities/Patient';

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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'observation-medicale', label: 'Observation médicale', icon: '🩺' },
    { id: 'biologie', label: 'Biologie', icon: '🧪' },
    { id: 'soins-medicaux', label: 'Soins médicaux', icon: '❤️' },
    { id: 'soins-infirmiers', label: 'Soins infirmiers', icon: '💉' },
    { id: 'traitement', label: 'Traitement', icon: '💊' },
    { id: 'document', label: 'Document', icon: '📄' },
  ];

  if (patient?.statut_patient === 'hospitalise') {
    tabs.push({
      id: 'compte-rendu',
      label: 'Compte Rendu',
      icon: '📝',
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
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour aux patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-blue-600"
        >
          Dashboard
        </button>
        <span>›</span>
        <button
          onClick={() => navigate('/patients-externes')}
          className="hover:text-blue-600"
        >
          Patients
        </button>
        <span>›</span>
        <span className="text-gray-900 font-medium">Dossier Patient</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {patient.nom_patient?.charAt(0)}
              {patient.prenom_patient?.charAt(0)}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {patient.nom_patient} {patient.prenom_patient}
              </h1>

              <div className="flex items-center gap-4 mt-1 text-sm">
                <span>
                  📅 {calculateAge(patient.date_naissance)} ans
                </span>
                <span>•</span>
                <span>
                  {patient.sexe_patient === 'M'
                    ? '♂️ Homme'
                    : '♀️ Femme'}
                </span>
                <span>•</span>
                <span>📋 {patient.num_dossier}</span>
              </div>
            </div>
          </div>

          {patient.statut_patient === 'externe' && (
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Hospitaliser
            </button>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard
          icon="📞"
          label="Téléphone"
          value={patient.tel_patient || 'Non renseigné'}
        />
        <InfoCard
          icon="🩸"
          label="Groupe sanguin"
          value={patient.groupe_sanguin || 'Inconnu'}
        />
        <InfoCard
          icon="📏"
          label="Taille"
          value={
            patient.taille_patient
              ? `${patient.taille_patient} cm`
              : '-'
          }
        />
        <InfoCard
          icon="⚖️"
          label="Poids"
          value={
            patient.poids_patient
              ? `${patient.poids_patient} kg`
              : '-'
          }
        />
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
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
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}