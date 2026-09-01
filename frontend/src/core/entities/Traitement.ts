import type { StatutValidation } from '../../shared/types';

export type TypeDocument = 'ordonnance' | 'traitement';

export interface Traitement {
  id_traitement:  number;
  id_patient:     number;
  id_admission?:  number;
  id_ordonnance?: string;

  date_prescription:  Date | string;
  heure_prescription: string;
  type_document:      TypeDocument;

  diagnostic?:        string;
  prescripteur?:      string;
  lieu_prescription?: string;

  medicament:              string;
  dosage?:                 string;
  voie_administration?:    string;
  frequence?:              string;
  duree?:                  string;
  instructions?:           string;
  observations_speciales?: string;
  description_libre?:      string;

  cree_par_id?: number;
  statut:       StatutValidation;
  valide_par?:  number;
  valide_le?:   string;
  valideur_nom?:    string;
  valideur_prenom?: string;
  mode_garde:   boolean;

  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateTraitementDTO {
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       TypeDocument;
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  medicament:          string;
  dosage?:             string;
  voie_administration?: string;
  frequence?:          string;
  duree?:              string;
  instructions?:       string;
  observations_speciales?: string;
  description_libre?:  string;
}

export interface UpdateTraitementDTO {
  date_prescription?:   string;
  heure_prescription?:  string;
  type_document?:       TypeDocument;
  diagnostic?:          string;
  prescripteur?:        string;
  lieu_prescription?:   string;
  medicament?:          string;
  dosage?:              string;
  voie_administration?: string;
  frequence?:           string;
  duree?:               string;
  instructions?:        string;
  observations_speciales?: string;
  description_libre?:   string;
}

export interface MedicamentDTO {
  medicament:          string;
  dosage?:             string;
  voie_administration?: string;
  frequence?:          string;
  duree?:              string;
  instructions?:       string;
  description_libre?:  string;
}

export interface CreateOrdonnanceDTO {
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       TypeDocument;
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  observations_speciales?: string;
  medicaments:         MedicamentDTO[];
}