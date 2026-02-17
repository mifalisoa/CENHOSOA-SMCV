export interface BilanBiologique {
  id_bilan: number;
  id_patient: number;
  id_admission?: number;
  
  date_prelevement: Date | string;
  heure_prelevement: string;
  
  // Paramètres biologiques
  creatinine?: number;
  glycemie?: number;
  crp?: number;
  inr?: number;
  nfs?: number;
  
  // Champs génériques
  type_bilan?: string;
  resultat?: string;
  interpretation?: string;
  
  // Métadonnées
  prescripteur?: string;
  laboratoire?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateBilanBiologiqueDTO {
  id_patient: number;
  id_admission?: number;
  date_prelevement: string;
  heure_prelevement: string;
  creatinine?: number;
  glycemie?: number;
  crp?: number;
  inr?: number;
  nfs?: number;
  type_bilan?: string;
  resultat?: string;
  interpretation?: string;
  prescripteur?: string;
  laboratoire?: string;
}