import type { Observation } from './Observation';

export type ParametresVitaux   = Observation['examen_general'];
export type ExamenCentral      = Observation['examen_physique_central'];
export type ExamenPeripherique = Observation['examen_physique_peripherique'];

export interface EvolutionPatient {
  id_evolution:   number;
  id_observation: number;
  id_patient:     number;
  date_visite:    Date | string;
  heure_visite:   string;
  medecin:        string;
  resume_patient?: string;
  parametres?:                     ParametresVitaux;
  examen_physique_central?:        ExamenCentral;
  examen_physique_peripherique?:   ExamenPeripherique;
  resultats_examens_paracliniques?: string;
  traitement?:    string;
  problemes_poses?: string;
  cat?:           string;
  created_at:     Date | string;
  updated_at:     Date | string;
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
  traitement?:     string;
  problemes_poses?: string;
  cat?:            string;
}