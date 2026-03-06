
export interface Patient {
  id_patient: number;
  num_dossier: string;
  nom_patient: string;
  prenom_patient: string;
  date_naissance: Date | string;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact: string;
  tel_urgence: string;
  statut_patient: 'externe' | 'hospitalisé' | 'sorti';
  date_enregistrement: Date;
  // ✅ NOUVEAUX CHAMPS ESSENTIELS
  medecin_traitant: string;
  prochain_rdv?: Date | string;
  lit?: string;
}

export interface CreatePatientDTO {
  nom_patient: string;
  prenom_patient: string;
  date_naissance: string | Date;
  sexe_patient: 'M' | 'F';
  adresse_patient: string;
  tel_patient?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact: string;
  tel_urgence: string;
  statut_patient?: 'externe' | 'hospitalisé';
  // ✅ NOUVEAUX CHAMPS
  medecin_traitant: string;
  prochain_rdv?: string | Date;
  lit?: string;
}

export interface UpdatePatientDTO {
  nom_patient?: string;
  prenom_patient?: string;
  date_naissance?: string | Date;
  sexe_patient?: 'M' | 'F';
  adresse_patient?: string;
  tel_patient?: string;
  assurance?: string;
  num_assurance?: string;
  personne_contact?: string;
  tel_urgence?: string;
  statut_patient?: 'externe' | 'hospitalisé' | 'sorti';
  medecin_traitant?: string;
  prochain_rdv?: string | Date;
  id_lit?: number;
}

export interface PatientFilters {
  statut?: 'externe' | 'hospitalisé';
  assurance?: string;
  search?: string;
}