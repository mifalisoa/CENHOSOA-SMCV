import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ AJOUT
import { Plus, Search, Filter, Users, Calendar, MapPin } from 'lucide-react';
import { usePatients } from '../../../../hooks/usePatients';
import { AddPatientExterneModal } from '../../../../components/patients/AddPatientExterneModal';
// ❌ SUPPRIMÉ : import { PatientDossierModal } from '../../../../components/patients/PatientDossierModal';

import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { Card, CardContent } from '../../../../components/common/Card';
import type { Patient, CreatePatientDTO } from '../../../../../core/entities/Patient';

export default function PatientsExternesView() {
  const navigate = useNavigate(); // ✅ AJOUT
  const [showAddModal, setShowAddModal] = useState(false);
  // ❌ SUPPRIMÉ : const [showDossierModal, setShowDossierModal] = useState(false);
  // ❌ SUPPRIMÉ : const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { patients, loading, createPatient, searchPatients, total } = usePatients('externe');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      searchPatients(query);
    }
  };

  const handleAddPatient = async (data: CreatePatientDTO) => {
    await createPatient(data);
    setShowAddModal(false);
  };

  // ✅ REMPLACEMENT : Navigation au lieu du modal
  const handleViewDossier = (patient: Patient) => {
    navigate(`/patients/${patient.id_patient}/dossier`);
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients externes</h1>
          <p className="text-gray-500 mt-1">
            Gestion des patients en consultation externe
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white shadow-lg shadow-cyan-100"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-cyan-200 bg-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Total patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, prénom, n° dossier..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des patients */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun patient externe</h3>
            <p className="text-gray-500 mb-6">Commencez par ajouter votre premier patient externe</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un patient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <motion.div
              key={patient.id_patient}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200 hover:border-cyan-300"
                onClick={() => handleViewDossier(patient)} // ✅ Navigation vers la page
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {patient.nom_patient.charAt(0)}{patient.prenom_patient.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{patient.nom_patient} {patient.prenom_patient}</h3>
                        <p className="text-xs text-gray-500">{patient.num_dossier}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.sexe_patient === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {patient.sexe_patient === 'M' ? 'Homme' : 'Femme'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{calculateAge(patient.date_naissance)} ans</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{patient.adresse_patient}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Enregistré le {new Date(patient.date_enregistrement).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">Voir détails →</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal d'ajout uniquement */}
      <AddPatientExterneModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPatient}
      />

      {/* ❌ SUPPRIMÉ : PatientDossierModal */}
    </div>
  );
}