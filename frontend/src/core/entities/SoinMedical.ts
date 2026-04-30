import type { StatutValidation } from '../../shared/types';

export interface SoinMedical {
  id_soin_medical: number;
  id_patient:      number;
  id_admission?:   number;

  date_soin:  Date | string;
  heure_soin: string;

  ett?:   string;
  eto?:   string;
  autre?: string;

  realise_par:  string;
  cree_par_id?: number;
  /** @deprecated utiliser statut */
  verifie:      boolean;
  statut:       StatutValidation;
  valide_par?:  number;
  valide_le?:   string;
  valideur_nom?:    string;
  valideur_prenom?: string;
  mode_garde:   boolean;

  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateSoinMedicalDTO {
  id_patient:    number;
  id_admission?: number;
  date_soin:     string;
  heure_soin:    string;
  ett?:          string;
  eto?:          string;
  autre?:        string;
  realise_par:   string;
}