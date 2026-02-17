export interface BilanBiologique {
  id_bilan: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalisé
  
  date_prelevement: Date;
  heure_prelevement: string;
  
  // Paramètres biologiques principaux
  creatinine?: number;      // mg/L
  glycemie?: number;        // g/L
  crp?: number;             // mg/L (C-Reactive Protein)
  inr?: number;             // Sans unité
  nfs?: number;             // x10³/mm³ (Numération Formule Sanguine)
  
  // Champs texte pour compatibilité avec ancien format
  type_bilan?: string;      // ECG, Radio, Scanner, Échographie, Biologie
  resultat?: string;
  interpretation?: string;
  
  // Métadonnées
  prescripteur?: string;
  laboratoire?: string;
  created_at: Date;
  updated_at: Date;
}