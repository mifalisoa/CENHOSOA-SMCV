export interface SoinMedical {
  id_soin_medical: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalisé
  
  date_soin: Date;
  heure_soin: string;
  
  // Types de soins médicaux
  ett?: string;          // Échocardiographie Transthoracique
  eto?: string;          // Échocardiographie Transœsophagienne
  autre?: string;        // Autres soins
  
  // Métadonnées
  realise_par: string;   // Médecin qui a réalisé le soin
  verifie: boolean;      // Soin vérifié ou non
  created_at: Date;
  updated_at: Date;
}