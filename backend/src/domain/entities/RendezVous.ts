// backend/src/domain/entities/RendezVous.ts

export interface RendezVous {
  id_rdv: number;
  id_patient: number;
  id_docteur: number;
  date_rdv: Date | string;
  heure_rdv: string; // Format: 'HH:MM' (VARCHAR(5))
  duree_estimee?: number; // SMALLINT (30 par défaut)
  type_rdv?: string; // 'consultation' | 'suivi' | 'urgence' | 'controle'
  motif_rdv: string;
  statut_rdv: string; // 'planifié' | 'confirmé' | 'terminé' | 'annulé' | 'absent'
  salle?: string;
  notes_rdv?: string;
  date_creation_rdv?: Date | string;
  date_annulation?: Date | string;
  raison_annulation?: string;
}

export interface CreateRendezVousDTO {
  id_patient: number;
  id_docteur: number;
  date_rdv: string; // Format: 'YYYY-MM-DD'
  heure_rdv: string; // Format: 'HH:MM'
  duree_estimee?: number;
  type_rdv?: string;
  motif_rdv: string;
  statut_rdv?: string;
  salle?: string;
  notes_rdv?: string;
}

export interface UpdateRendezVousDTO {
  id_docteur?: number;
  date_rdv?: string;
  heure_rdv?: string;
  duree_estimee?: number;
  type_rdv?: string;
  motif_rdv?: string;
  statut_rdv?: string;
  salle?: string;
  notes_rdv?: string;
  date_annulation?: string;
  raison_annulation?: string;
}

export interface RendezVousWithDetails extends RendezVous {
  patient_nom?: string;
  patient_prenom?: string;
  patient_age?: number;
  patient_sexe?: string;
  docteur_nom?: string;
  docteur_prenom?: string;
  docteur_specialite?: string;
}