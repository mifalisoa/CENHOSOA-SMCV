export interface SoinMedical {
  id_soin_medical: number;
  id_patient: number;
  id_admission?: number;
  
  date_soin: Date | string;
  heure_soin: string;
  
  ett?: string;
  eto?: string;
  autre?: string;
  
  realise_par: string;
  verifie: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateSoinMedicalDTO {
  id_patient: number;
  id_admission?: number;
  date_soin: string;
  heure_soin: string;
  ett?: string;
  eto?: string;
  autre?: string;
  realise_par: string;
  verifie?: boolean;
}