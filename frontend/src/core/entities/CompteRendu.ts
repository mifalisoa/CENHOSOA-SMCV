export interface CompteRendu {
  id_compte_rendu: number;
  id_patient: number;
  id_admission: number;

  date_admission: Date | string;
  date_sortie: Date | string;

  contexte?: string;
  resume_observation: string;
  examens_paracliniques?: string;
  diagnostic: string;
  traitement_sortie: string;
  evolution?: string;
  prochain_rdv?: string;

  medecin: string;
  cree_par_id?: number;
  modifie_par_id?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateCompteRenduDTO {
  id_patient: number;
  id_admission: number;
  date_admission: string;
  date_sortie: string;
  contexte?: string;
  resume_observation: string;
  examens_paracliniques?: string;
  diagnostic: string;
  traitement_sortie: string;
  evolution?: string;
  prochain_rdv?: string;
  medecin?: string;
}