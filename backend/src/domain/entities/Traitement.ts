export interface Traitement {
  id_traitement: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalisé
  
  date_prescription: Date;
  heure_prescription: string;
  
  type_document: 'ordonnance' | 'traitement'; // Ordonnance ou simple traitement
  
  // Informations ordonnance (si type = ordonnance)
  diagnostic?: string;
  prescripteur?: string;
  lieu_prescription?: string;
  
  // Détails du médicament
  medicament: string;
  dosage: string;
  voie_administration: string;     // IV, IM, Per Os, etc.
  frequence: string;                // 3x/jour, toutes les 8h, etc.
  duree: string;                    // 7 jours, 2 semaines, etc.
  instructions?: string;            // Instructions spécifiques
  
  // Ordonnance spécifique
  observations_speciales?: string;  // Pour ordonnance uniquement
  
  // Métadonnées
  created_at: Date;
  updated_at: Date;
}