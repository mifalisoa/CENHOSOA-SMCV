export interface SignatureSection {
  medecin: string;
  role:    string;
  date:    string;
  heure:   string;
}
export interface ObservationSignatures {
  motif?:                           SignatureSection[];
  histoire_maladie?:                SignatureSection[];
  antecedents?:                     SignatureSection[];
  examen_general?:                  SignatureSection[];
  examen_physique_central?:         SignatureSection[];
  examen_physique_peripherique?:    SignatureSection[];
  resume_syndromique?:              SignatureSection[];
  hypotheses_diagnostiques?:        SignatureSection[];
  resultats_examens_paracliniques?: SignatureSection[];
  cat?:                             SignatureSection[];
  diagnostic_retenu?:               SignatureSection[];
}

export interface Observation {
  id_observation:   number;
  id_patient:       number;
  id_admission?:    number;
  type_observation: 'externe' | 'hospitalise';
  date_observation: Date | string;
  heure_observation: string;
  motif_consultation?:   string;
  motif_hospitalisation?: string;
  histoire_maladie?: string;
  date_entree?:       Date | string;
  diagnostic_entree?: string;
  date_transeat?:     Date | string;
  date_sortie?:       Date | string;
  diagnostic_sortie?: string;
  antecedents_cmo?: {
    chirurgicaux?:        string;
    medicaux?:            string;
    gyneco_obstetricaux?: string;
  };
  antecedents_gmo?: {
    genetique?: string;
    mode_vie?:  string;
    per_os?:    string;
  };
  antecedents_che?: {
    curriculum_vitae?:        string;
    hospitalisation?:         string;
    niveau_socio_economique?: string;
  };
  examen_general?: {
    etat_general?:              string;
    conscience?:                string;
    poids?:                     number;
    taille?:                    number;
    imc?:                       number;
    temperature?:               number;
    frequence_respiratoire?:    number;
    frequence_cardiaque?:       number;
    tension_arterielle_gauche?: string;
    tension_arterielle_droite?: string;
    saturation_oxygene?:        number;
    diurese?:                   string;
    tour_taille?:               number;
  };
  examen_physique_central?: {
    choc_pointe?:           string;
    bdc?:                   string;
    souffles?:              string;
    pouls_peripheriques?:   string;
    veines_jugulaires?:     string;
    appareil_respiratoire?: string;
    foie?:                  string;
  };
  examen_physique_peripherique?: {
    conjonctives_muqueuses?: string;
    etat_bucco_dentaire?:    string;
    masse_cervicale?:        string;
    abdomen?:                string;
    masse_palpee?:           string;
    membres_inferieurs_omi?: string;
    mollets?:                string;
    extremites?:             string;
    autres?:                 string;
  };
  resume_syndromique?:              string;
  hypotheses_diagnostiques?:        string;
  cat?:                             string;
  resultats_examens_paracliniques?: string;
  diagnostic_retenu?:               string;
  /** @deprecated utiliser evolution_patient */
  evolution_quotidienne?: string;
  signatures?:            ObservationSignatures;
  medecin:    string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateObservationDTO {
  id_patient:       number;
  id_admission?:    number;
  type_observation: 'externe' | 'hospitalise';
  date_observation: string;
  heure_observation: string;
  motif_consultation?:   string;
  motif_hospitalisation?: string;
  histoire_maladie?: string;
  date_entree?:       string;
  diagnostic_entree?: string;
  date_transeat?:     string;
  date_sortie?:       string;
  diagnostic_sortie?: string;
  antecedents_cmo?: Observation['antecedents_cmo'];
  antecedents_gmo?: Observation['antecedents_gmo'];
  antecedents_che?: Observation['antecedents_che'];
  examen_general?:               Observation['examen_general'];
  examen_physique_central?:      Observation['examen_physique_central'];
  examen_physique_peripherique?: Observation['examen_physique_peripherique'];
  resume_syndromique?:              string;
  hypotheses_diagnostiques?:        string;
  cat?:                             string;
  resultats_examens_paracliniques?: string;
  diagnostic_retenu?:               string;
  signatures?:                      ObservationSignatures;
  medecin: string;
}