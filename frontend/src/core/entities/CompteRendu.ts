export interface CompteRendu {
  id_compte_rendu: number;
  id_patient: number;
  id_admission: number;
  
  date_admission: Date | string;
  date_sortie: Date | string;
  
  resume_observation: string;
  diagnostic_sortie: string;
  traitement_sortie: string;
  prochain_rdv?: string;
  
  modalite_sortie: 'gueri' | 'ameliore' | 'transfert' | 'deces';
  lieu_transfert?: string;
  
  medecin: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateCompteRenduDTO {
  id_patient: number;
  id_admission: number;
  date_admission: string;
  date_sortie: string;
  resume_observation: string;
  diagnostic_sortie: string;
  traitement_sortie: string;
  prochain_rdv?: string;
  modalite_sortie: 'gueri' | 'ameliore' | 'transfert' | 'deces';
  lieu_transfert?: string;
  medecin: string;
}