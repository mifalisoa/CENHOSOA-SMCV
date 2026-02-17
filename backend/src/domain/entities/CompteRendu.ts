export interface CompteRendu {
  id_compte_rendu: number;
  id_patient: number;
  id_admission: number; // OBLIGATOIRE - un compte rendu est toujours lié à une admission
  
  date_admission: Date;
  date_sortie: Date;
  
  // Contenu du compte rendu
  resume_observation: string;         // Résumé de l'observation médicale
  diagnostic_sortie: string;          // Diagnostic final à la sortie
  traitement_sortie: string;          // Traitement/ordonnance de sortie
  prochain_rdv?: string;              // Prochain rendez-vous (optionnel)
  
  // Modalité de sortie
  modalite_sortie: 'gueri' | 'ameliore' | 'transfert' | 'deces';
  lieu_transfert?: string;            // Si modalité = transfert
  
  // Métadonnées
  medecin: string;                    // Médecin qui a rédigé le compte rendu
  created_at: Date;
  updated_at: Date;
}