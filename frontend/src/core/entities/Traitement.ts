export interface Traitement {
  id_traitement: number;
  id_patient: number;
  id_admission?: number;
  
  date_prescription: Date | string;
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
  
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateTraitementDTO {
  id_patient: number;
  id_admission?: number;
  date_prescription: string;
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
}