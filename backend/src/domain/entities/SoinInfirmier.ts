import { StatutValidation, ValidateurInfo } from '../../shared/types';

export interface SoinInfirmier extends ValidateurInfo {
  id_soin_infirmier: number;
  id_patient:        number;
  id_admission?:     number;

  date_soin:  Date;
  heure_soin: string;

  // Types de soins infirmiers
  ecg?:          string; // ECG
  ecg_dii_long?: string; // ECG + DII long
  injection_iv?: string; // Injection intraveineuse
  injection_im?: string; // Injection intramusculaire
  pse?:          string; // PSE (Pousse-Seringue Électrique)
  pansement?:    string; // Pansement
  autre_soins?:  string; // Autres soins

  // Métadonnées
  realise_par:  string;  // Infirmier/interne qui a réalisé le soin
  cree_par_id?: number;  // FK → utilisateurs — détermine si validation requise
  /** @deprecated Utiliser statut */
  verifie: boolean;
  statut:  StatutValidation;

  created_at: Date;
  updated_at: Date;
}