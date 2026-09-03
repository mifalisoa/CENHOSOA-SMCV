export interface CompteRenduConsultation {
  id_compte_rendu_consultation: number;
  id_patient: number;

  date_consultation: Date | string;
  motif_consultation: string;

  contexte?: string;
  examens_paracliniques?: string;
  diagnostic: string;
  traitement: string;
  evolution?: string;
  prochain_rdv?: string;

  medecin: string;
  cree_par_id?: number;
  modifie_par_id?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateCompteRenduConsultationDTO {
  id_patient: number;
  date_consultation: string;
  motif_consultation: string;
  contexte?: string;
  examens_paracliniques?: string;
  diagnostic: string;
  traitement: string;
  evolution?: string;
  prochain_rdv?: string;
  medecin?: string;
}