export interface CompteRenduConsultation {
  id_compte_rendu_consultation: number;
  id_patient: number;

  date_consultation: Date;
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
  created_at: Date;
  updated_at: Date;
}

export type CreateCompteRenduConsultationDTO = Omit<
  CompteRenduConsultation,
  'id_compte_rendu_consultation' | 'created_at' | 'updated_at'
>;

export type UpdateCompteRenduConsultationDTO = Partial<
  Omit<CompteRenduConsultation, 'id_compte_rendu_consultation' | 'id_patient' | 'created_at' | 'updated_at'>
>;