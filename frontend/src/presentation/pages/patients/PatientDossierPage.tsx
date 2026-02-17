import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import type { Patient } from '../../../core/entities/Patient';
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
  const [activeTab, setActiveTab] = useState<TabType>('observation-medicale');

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getPatientById(parseInt(id));
        setPatient(data);
      } catch (error) {
        console.error('Erreur chargement patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const calculateAge = (dateNaissance: Date | string) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateNaissance);
      if (isNaN(birthDate.getTime())) return 0;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 0;
    }
  };

  const tabs = [
    {
      id: 'observation-medicale' as TabType,
      label: 'Observation médicale',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'biologie' as TabType,
      label: 'Biologie',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'soins-medicaux' as TabType,
      label: 'Soins médicaux',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'soins-infirmiers' as TabType,
      label: 'Soins infirmiers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'traitement' as TabType,
      label: 'Traitement',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'document' as TabType,
      label: 'Document',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  // Ajouter l'onglet Compte Rendu pour les patients hospitalisés
  if (patient?.statut === 'hospitalise' || patient?.statut === 'sorti') {
    tabs.push({
      id: 'compte-rendu' as TabType,
      label: 'Compte Rendu',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Patient non trouvé</p>
          <button
            onClick={() => navigate('/patients')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-3 flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600">
              Dashboard
            </button>
            <span>›</span>
            <button onClick={() => navigate('/patients')} className="hover:text-blue-600">
              Patients
            </button>
            <span>›</span>
            <span>Service Cardiologie</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">Dossier Patient</span>
          </div>

          {/* Titre et actions */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Dossier Patient {patient.statut === 'externe' ? 'Externe' : 'Hospitalisé'} Détaillé
                  </h1>
                  <p className="text-sm text-gray-600">
                    Consultation du dossier médical complet
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger .zip
              </button>
              {patient.statut === 'externe' && (
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Hospitaliser
                </button>
              )}
            </div>
          </div>

          {/* Infos patient */}
          <div className="py-4 grid grid-cols-6 gap-6 border-t border-gray-100">
            <InfoCard icon="👤" label="Nom" value={patient.nom || 'Non spécifié'} />
            <InfoCard icon="👤" label="Prénom" value={patient.prenom || 'Mifaly'} />
            <InfoCard icon="🎂" label="Âge" value={`${calculateAge(patient.date_naissance)} ans`} />
            <InfoCard icon="⚥" label="Genre" value={patient.sexe === 'M' ? 'Masculin' : 'Féminin'} />
            <InfoCard icon="📞" label="Téléphone" value={patient.telephone || '0340259643'} />
            <InfoCard icon="❤️" label="DM" value="Aucun" />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-2 py-4 px-6 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={activeTab === tab.id ? 'text-cyan-500' : 'text-gray-400'}>
                  {tab.icon}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'observation-medicale' && <ObservationsTab patient={patient} />}
          {activeTab === 'biologie' && <BilansBiologiquesTab patient={patient} />}
          {activeTab === 'soins-medicaux' && <SoinsMedicauxTab patient={patient} />}
          {activeTab === 'soins-infirmiers' && <SoinsInfirmiersTab patient={patient} />}
          {activeTab === 'traitement' && <TraitementsTab patient={patient} />}
          {activeTab === 'document' && <DocumentsTab patient={patient} />}
          {activeTab === 'compte-rendu' && <ComptesRendusTab patient={patient} />}
        </div>
      </div>
    </div>
  );
}

// Composant InfoCard
function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}