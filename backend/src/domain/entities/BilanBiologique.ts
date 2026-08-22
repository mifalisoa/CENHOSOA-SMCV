export interface BilanBiologique {
  id_bilan: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalise

  date_prelevement: Date;
  heure_prelevement: string;

  // Parametres biologiques principaux
  creatinine?: number;      // mg/L
  glycemie?: number;        // g/L
  crp?: number;             // mg/L (C-Reactive Protein)
  inr?: number;             // Sans unite
  nfs?: number;             // x10 puissance 3/mm3 (Numeration Formule Sanguine)

  // Champs texte pour compatibilite avec ancien format
  type_bilan?: string;      // ECG, Radio, Scanner, Echographie, Biologie
  resultat?: string;
  interpretation?: string;

  // Metadonnees
  prescripteur?: string;     // Medecin qui a demande l'examen, texte libre
  laboratoire?: string;
  cree_par_id?: number;      // Utilisateur ayant saisi la fiche, derive de req.user
  modifie_par_id?: number;   // Utilisateur ayant modifie en dernier, derive de req.user
  created_at: Date;
  updated_at: Date;
}