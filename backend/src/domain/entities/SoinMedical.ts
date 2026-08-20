import { StatutValidation, ValidateurInfo } from '../../shared/types';

export interface SoinMedical extends ValidateurInfo {
  id_soin_medical: number;
  id_patient:      number;
  id_admission?:   number;

  date_soin:  Date;
  heure_soin: string;

  // Types de soins médicaux
  ett?:   string; // Échocardiographie Transthoracique
  eto?:   string; // Échocardiographie Transœsophagienne
  autre?: string; // Autres soins

  // Métadonnées
  realise_par:  string;  // Médecin/interne qui a réalisé le soin
  cree_par_id?: number;  // FK → utilisateurs — détermine si validation requise
  modifie_par_id?: number;

  /** @deprecated Utiliser statut */
  verifie: boolean;
  statut:  StatutValidation;

  created_at: Date;
  updated_at: Date;
}