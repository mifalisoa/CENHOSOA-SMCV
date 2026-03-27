// frontend/src/core/entities/Patient.ts  &  backend/src/domain/entities/Patient.ts

export interface Patient {
  id_patient:          number;
  num_dossier:         string;
  nom_patient:         string;
  prenom_patient:      string;
  date_naissance:      Date | string;
  sexe_patient:        'M' | 'F';
  adresse_patient:     string;
  tel_patient?:        string;
  assurance?:          string;
  num_assurance?:      string;
  personne_contact?:   string;
  tel_urgence?:        string;
  statut_patient:      'externe' | 'hospitalise' | 'sorti'; // sans accent
  date_enregistrement: Date;
  medecin_traitant:    string;
  id_medecin_traitant?: number | null;                       // ← nouveau
  prochain_rdv?:       Date | string;
  lit?:                string;
}

export interface CreatePatientDTO {
  nom_patient:         string;
  prenom_patient:      string;
  date_naissance:      string | Date;
  sexe_patient:        'M' | 'F';
  adresse_patient:     string;
  tel_patient?:        string;
  assurance?:          string;
  num_assurance?:      string;
  personne_contact?:   string;
  tel_urgence?:        string;
  statut_patient?:     'externe' | 'hospitalise';            // sans accent
  medecin_traitant:    string;
  id_medecin_traitant?: number | null;                       // ← nouveau
  prochain_rdv?:       string | Date;
  lit?:                string;
}

export interface UpdatePatientDTO {
  nom_patient?:        string;
  prenom_patient?:     string;
  date_naissance?:     string | Date;
  sexe_patient?:       'M' | 'F';
  adresse_patient?:    string;
  tel_patient?:        string;
  assurance?:          string;
  num_assurance?:      string;
  personne_contact?:   string;
  tel_urgence?:        string;
  statut_patient?:     'externe' | 'hospitalise' | 'sorti';  // sans accent
  medecin_traitant?:   string;
  id_medecin_traitant?: number | null;
  prochain_rdv?:       string | Date;
  id_lit?:             number;
}

export interface PatientFilters {
  statut?:              'externe' | 'hospitalise';           // sans accent
  assurance?:           string;
  search?:              string;
  id_medecin_traitant?: number;                             // ← nouveau
}