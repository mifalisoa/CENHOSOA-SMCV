export interface Traitement {
  id_traitement: number;
  id_patient: number;
  id_admission?: number;

  // ✅ UUID partagé entre tous les médicaments d'une même ordonnance
  id_ordonnance?: string;

  date_prescription: Date;
  heure_prescription: string;

  type_document: 'ordonnance' | 'traitement';

  diagnostic?: string;
  prescripteur?: string;
  lieu_prescription?: string;

  medicament: string;
  dosage: string;
  voie_administration: string;
  frequence: string;
  duree: string;
  instructions?: string;
  observations_speciales?: string;

  created_at: Date;
  updated_at: Date;
}

// DTO pour créer un seul médicament (usage interne)
export type CreateTraitementDTO = Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>;

// DTO pour créer une ordonnance avec N médicaments
export interface CreateOrdonnanceDTO {
  // Informations communes à tous les médicaments de l'ordonnance
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       'ordonnance' | 'traitement';
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  observations_speciales?: string;

  // Liste des médicaments
  medicaments: MedicamentDTO[];
}

export interface MedicamentDTO {
  medicament:          string;
  dosage:              string;
  voie_administration: string;
  frequence:           string;
  duree:               string;
  instructions?:       string;
}