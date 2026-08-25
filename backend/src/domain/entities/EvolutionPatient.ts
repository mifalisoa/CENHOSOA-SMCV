import { Observation } from './Observation';

// Reutilise exactement les memes structures JSONB que Observation
export type ParametresVitaux      = Observation['examen_general'];
export type ExamenCentral         = Observation['examen_physique_central'];
export type ExamenPeripherique    = Observation['examen_physique_peripherique'];

export interface EvolutionPatient {
  id_evolution:    number;
  id_observation:  number;
  id_patient:      number;

  // Identite de la visite
  date_visite:     Date;
  heure_visite:    string;
  medecin:         string;

  // Resume clinique du jour
  resume_patient?: string;

  // Parametres vitaux
  parametres?:                     ParametresVitaux;
  examen_physique_central?:        ExamenCentral;
  examen_physique_peripherique?:   ExamenPeripherique;

  // Decisions medicales du jour
  resultats_examens_paracliniques?: string;
  traitement?:                      string;
  problemes_poses?:                 string;
  cat?:                             string;

  // Tracabilite - derive de l'utilisateur authentifie, jamais du body
  cree_par_id?:    number;
  modifie_par_id?: number;

  created_at: Date;
  updated_at: Date;
}

export interface CreateEvolutionPatientDTO {
  id_observation:  number;
  id_patient:      number;
  date_visite:     string;
  heure_visite:    string;
  medecin:         string;
  resume_patient?: string;
  parametres?:                     ParametresVitaux;
  examen_physique_central?:        ExamenCentral;
  examen_physique_peripherique?:   ExamenPeripherique;
  resultats_examens_paracliniques?: string;
  traitement?:                      string;
  problemes_poses?:                 string;
  cat?:                             string;
  cree_par_id?:                     number;
}