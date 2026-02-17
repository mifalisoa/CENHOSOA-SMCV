export interface Patient {
  id_patient: number;
  num_dossier: string;
  nom_patient: string;
  prenom_patient: string;
  date_naissance: string;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  profession?: string;
  groupe_sanguin?: string;
  taille_patient?: number;
  poids_patient?: number;
  allergies?: string;
  antecedents?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact: string;
  tel_urgence: string;
  statut_patient: 'externe' | 'hospitalise';
  date_enregistrement: string;
}

export interface CreatePatientDTO {
  nom_patient: string;
  prenom_patient: string;
  date_naissance: string;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  profession?: string;
  groupe_sanguin?: string;
  taille_patient?: number;
  poids_patient?: number;
  allergies?: string;
  antecedents?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact: string;
  tel_urgence: string;
  statut_patient: 'externe' | 'hospitalise';
}

export interface UpdatePatientDTO {
  nom_patient?: string;
  prenom_patient?: string;
  date_naissance?: string;
  sexe_patient?: 'M' | 'F';
  adresse_patient?: string;
  tel_patient?: string;
  profession?: string;
  groupe_sanguin?: string;
  taille_patient?: number;
  poids_patient?: number;
  allergies?: string;
  antecedents?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact?: string;
  tel_urgence?: string;
  statut_patient?: 'externe' | 'hospitalise';
}

export interface PaginatedPatients {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}