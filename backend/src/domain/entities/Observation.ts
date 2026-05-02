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
  date_observation: Date;
  heure_observation: string;

  // I. Motif
  motif_consultation?:   string;
  motif_hospitalisation?: string;

  // Histoire
  histoire_maladie?: string;

  // Spécifique hospitalisation
  date_entree?:       Date;
  diagnostic_entree?: string;
  date_transeat?:     Date;
  date_sortie?:       Date;
  diagnostic_sortie?: string;

  // III. Antécédents
  antecedents_cmo?: {
    chirurgicaux?:       string;
    medicaux?:           string;
    gyneco_obstetricaux?: string;
  };
  antecedents_gmo?: {
    genetique?:  string;
    mode_vie?:   string;
    per_os?:     string;
  };
  antecedents_che?: {
    curriculum_vitae?:       string;
    hospitalisation?:        string;
    niveau_socio_economique?: string;
  };

  // IV. Examen général
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

  // V. Examen physique central
  examen_physique_central?: {
    choc_pointe?:         string;
    bdc?:                 string;
    souffles?:            string;
    pouls_peripheriques?: string;
    veines_jugulaires?:   string;
    appareil_respiratoire?: string;
    foie?:                string;
  };

  // VI. Examen physique périphérique
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

  // VII. Synthèse
  resume_syndromique?:              string;
  hypotheses_diagnostiques?:        string;
  cat?:                             string;
  resultats_examens_paracliniques?: string;
  diagnostic_retenu?:               string;

  /** @deprecated utiliser evolution_patient */
  evolution_quotidienne?: string;

  // Signatures par section — qui a rempli quoi et quand
  signatures?: ObservationSignatures;

  // Médecin principal (créateur de l'observation)
  medecin:    string;
  created_at: Date;
  updated_at: Date;
}