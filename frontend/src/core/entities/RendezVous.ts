// frontend/src/core/entities/RendezVous.ts

export interface RendezVous {
  id_rdv: number;
  id_patient: number;
  id_docteur: number;
  date_rdv: string | Date;
  heure_rdv: string;
  duree_estimee?: number;
  type_rdv?: 'consultation' | 'suivi' | 'urgence' | 'controle';
  motif_rdv: string;
  statut_rdv: 'planifie' | 'confirme' | 'termine' | 'annule' | 'absent';
  salle?: string;
  notes_rdv?: string;
  date_creation_rdv?: string | Date;
  date_annulation?: string | Date;
  raison_annulation?: string;

  // Détails enrichis (si retournés par l'API)
  patient_nom?: string;
  patient_prenom?: string;
  patient_age?: number;
  patient_sexe?: string;
  docteur_nom?: string;
  docteur_prenom?: string;
  docteur_specialite?: string;
}

export interface CreateRendezVousDTO {
  id_patient: number;
  id_docteur: number;
  date_rdv: string;
  heure_rdv: string;
  duree_estimee?: number;
  type_rdv?: 'consultation' | 'suivi' | 'urgence' | 'controle';
  motif_rdv: string;
  statut_rdv?: 'planifie' | 'confirme';
  salle?: string;
  notes_rdv?: string;
}

export interface UpdateRendezVousDTO {
  id_docteur?: number;
  date_rdv?: string;
  heure_rdv?: string;
  duree_estimee?: number;
  type_rdv?: 'consultation' | 'suivi' | 'urgence' | 'controle';
  motif_rdv?: string;
  statut_rdv?: 'planifie' | 'confirme' | 'termine' | 'annule' | 'absent';
  salle?: string;
  notes_rdv?: string;
  date_annulation?: string;
  raison_annulation?: string;
}

export interface RendezVousFilters {
  date?: string;
  date_debut?: string;
  date_fin?: string;
  patient_id?: number;
  docteur_id?: number;
  statut?: 'planifie' | 'confirme' | 'termine' | 'annule' | 'absent';
  type?: 'consultation' | 'suivi' | 'urgence' | 'controle';
}