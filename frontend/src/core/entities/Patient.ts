// frontend/src/core/entities/Patient.ts

export interface Patient {
  id_patient: number;
  num_dossier: string;
  nom_patient: string;
  prenom_patient: string;
  date_naissance: Date | string;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  assurance?: string; // PAS, FMILIF, OCONV, PERS
  statut_patient: 'externe' | 'hospitalisé' | 'hospitalise' | 'sorti';
  date_enregistrement: Date | string;
  medecin_traitant: string;
}

export interface CreatePatientDTO {
  nom_patient: string;
  prenom_patient: string;
  date_naissance: string | Date;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  assurance?: string;
  statut_patient?: 'externe' | 'hospitalisé' | 'hospitalise' | 'sorti';
  medecin_traitant: string;
}

export interface UpdatePatientDTO {
  nom_patient?: string;
  prenom_patient?: string;
  date_naissance?: string | Date;
  sexe_patient?: 'M' | 'F';
  adresse_patient?: string;
  tel_patient?: string;
  assurance?: string;
  statut_patient?: 'externe' | 'hospitalisé' | 'hospitalise' | 'sorti';
  medecin_traitant?: string;
}

export interface PatientFilters {
  statut?: 'externe' | 'hospitalisé' | 'hospitalise' | 'sorti';
  assurance?: string;
  search?: string;
}

// ← Ajout : type retourné par les méthodes paginées du PatientRepository
export interface PaginatedPatients {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}