import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../../hooks/usePatients';
import { AddPatientHospitaliseModal } from '../../../../components/patients/AddPatientHospitaliseModal';
import { 
  Search, 
  User, 
  Calendar, 
  Phone, 
  MapPin,
  Eye,
  Bed,
  Building2,
  Clock,
  Plus
} from 'lucide-react';
import type { Patient } from '../../../../../../core/entities/Patient';

export default function PatientsHospitalises() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // On stabilise l'objet de filtre pour éviter le re-render infini
  const options = useMemo(() => ({ statut: 'hospitalise' }), []);
  
  const { patients, loading, error, createPatient } = usePatients(options);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreatePatient = async (data: any) => {
    await createPatient({ ...data, statut_patient: 'hospitalise' });
    setIsAddModalOpen(false);
  };

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.nom_patient?.toLowerCase().includes(search) ||
      patient.prenom_patient?.toLowerCase().includes(search) ||
      patient.num_dossier?.toLowerCase().includes(search) ||
      patient.tel_patient?.toLowerCase().includes(search)
    );
  });

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) return 0;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non renseignée';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Erreur lors du chargement des patients : {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Patients Hospitalisés
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} hospitalisé{filteredPatients.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Bouton Nouveau Patient */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium">Nouveau Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, n° dossier, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <Bed className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient hospitalisé'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-gray-500 mb-4">
              Commencez par ajouter votre premier patient hospitalisé
            </p>
          )}
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Essayez avec d'autres mots-clés
            </p>
          )}
          {!searchTerm && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter un patient
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id_patient}
              patient={patient}
              onViewDossier={() => navigate(`/patients/${patient.id_patient}/dossier`)}
              calculateAge={calculateAge}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Modal - CORRIGÉ : isOpen prop ajoutée */}
      <AddPatientHospitaliseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePatient}
      />
    </div>
  );
}

// --- Sous-composants ---

interface PatientCardProps {
  patient: Patient;
  onViewDossier: () => void;
  calculateAge: (date: string) => number;
  formatDate: (date: string) => string;
}

function PatientCard({ patient, onViewDossier, calculateAge, formatDate }: PatientCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
              {patient.nom_patient?.charAt(0)}
              {patient.prenom_patient?.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {patient.nom_patient} {patient.prenom_patient}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <Bed className="w-3 h-3 mr-1" />
                  Hospitalisé
                </span>
                <span className="text-sm text-gray-600">
                  N° {patient.num_dossier}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onViewDossier}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            Voir dossier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <InfoItem
            icon={<User className="w-4 h-4" />}
            label="Âge / Sexe"
            value={`${calculateAge(patient.date_naissance)} ans • ${patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}`}
          />
          <InfoItem
            icon={<Phone className="w-4 h-4" />}
            label="Téléphone"
            value={patient.tel_patient || 'Non renseigné'}
          />
          <InfoItem
            icon={<MapPin className="w-4 h-4" />}
            label="Adresse"
            value={patient.adresse_patient || 'Non renseignée'}
          />
          <InfoItem
            icon={<Calendar className="w-4 h-4" />}
            label="Date naissance"
            value={formatDate(patient.date_naissance)}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoItem
              icon={<Building2 className="w-4 h-4" />}
              label="Service"
              value="Médecine Générale" 
            />
            <InfoItem
              icon={<Bed className="w-4 h-4" />}
              label="Chambre / Lit"
              value="Ch. 12 - Lit A"
            />
            <InfoItem
              icon={<Clock className="w-4 h-4" />}
              label="Admis le"
              value={formatDate(patient.date_enregistrement)}
            />
          </div>
        </div>

        <button
          onClick={onViewDossier}
          className="sm:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md"
        >
          <Eye className="w-4 h-4" />
          Voir dossier
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}