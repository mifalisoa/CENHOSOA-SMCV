export interface CompteRendu {
  id_compte_rendu: number;
  id_patient: number;
  id_admission: number;

  date_admission: Date;
  date_sortie: Date;

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
  created_at: Date;
  updated_at: Date;
}