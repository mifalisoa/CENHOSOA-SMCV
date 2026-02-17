export interface SoinInfirmier {
  id_soin_infirmier: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalisé
  
  date_soin: Date;
  heure_soin: string;
  
  // Types de soins infirmiers
  ecg?: string;              // ECG
  ecg_dii_long?: string;     // ECG + DII long
  injection_iv?: string;     // Injection intraveineuse
  injection_im?: string;     // Injection intramusculaire
  pse?: string;              // PSE (Pousse-Seringue Électrique)
  pansement?: string;        // Pansement
  autre_soins?: string;      // Autres soins
  
  // Métadonnées
  realise_par: string;       // Infirmier qui a réalisé le soin
  verifie: boolean;          // Soin vérifié ou non
  created_at: Date;
  updated_at: Date;
}