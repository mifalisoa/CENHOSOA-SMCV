export interface SoinInfirmier {
  id_soin_infirmier: number;
  id_patient: number;
  id_admission?: number;
  
  date_soin: Date | string;
  heure_soin: string;
  
  ecg?: string;
  ecg_dii_long?: string;
  injection_iv?: string;
  injection_im?: string;
  pse?: string;
  pansement?: string;
  autre_soins?: string;
  
  realise_par: string;
  verifie: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateSoinInfirmierDTO {
  id_patient: number;
  id_admission?: number;
  date_soin: string;
  heure_soin: string;
  ecg?: string;
  ecg_dii_long?: string;
  injection_iv?: string;
  injection_im?: string;
  pse?: string;
  pansement?: string;
  autre_soins?: string;
  realise_par: string;
  verifie?: boolean;
}