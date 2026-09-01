import { StatutValidation, ValidateurInfo } from '../../shared/types';

export interface Traitement extends ValidateurInfo {
  id_traitement: number;
  id_patient:    number;
  id_admission?: number;

  id_ordonnance?: string;

  date_prescription:  Date;
  heure_prescription: string;

  type_document: 'ordonnance' | 'traitement';

  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;

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

  created_at: Date;
  updated_at: Date;
}

type ChampsExclus = 'id_traitement' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde';

export type CreateTraitementDTO = Omit<Traitement, ChampsExclus>;

export interface CreateOrdonnanceDTO {
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       'ordonnance' | 'traitement';
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  observations_speciales?: string;
  cree_par_id?:        number;

  medicaments: MedicamentDTO[];
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