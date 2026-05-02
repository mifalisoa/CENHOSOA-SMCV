import { Observation } from './Observation';

// Réutilise exactement les mêmes structures JSONB que Observation
export type ParametresVitaux      = Observation['examen_general'];
export type ExamenCentral         = Observation['examen_physique_central'];
export type ExamenPeripherique    = Observation['examen_physique_peripherique'];

export interface EvolutionPatient {
  id_evolution:    number;
  id_observation:  number;
  id_patient:      number;

  // Identité de la visite
  date_visite:     Date;
  heure_visite:    string;
  medecin:         string;

  // Résumé clinique du jour
  resume_patient?: string;

  // Paramètres vitaux
  parametres?:                     ParametresVitaux;
  examen_physique_central?:        ExamenCentral;
  examen_physique_peripherique?:   ExamenPeripherique;

  // Décisions médicales du jour
  resultats_examens_paracliniques?: string;
  traitement?:                      string;
  problemes_poses?:                 string;
  cat?:                             string;

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
}