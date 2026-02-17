export interface Observation {
  id_observation: number;
  id_patient: number;
  id_admission?: number; // Lien avec l'admission (si patient hospitalisé)
  type_observation: 'externe' | 'hospitalise';
  date_observation: Date;
  heure_observation: string;
  
  // I. Motif (différent selon le type)
  motif_consultation?: string;       // Pour EXTERNE
  motif_hospitalisation?: string;    // Pour HOSPITALISÉ
  
  // Histoire commune
  histoire_maladie?: string;
  
  // II. SPÉCIFIQUE HOSPITALISATION
  date_entree?: Date;
  diagnostic_entree?: string;
  date_transeat?: Date;
  date_sortie?: Date;
  diagnostic_sortie?: string;
  
  // III. Antécédents
  antecedents_cmo?: {
    chirurgicaux?: string;
    medicaux?: string;
    gyneco_obstetricaux?: string;
  };
  antecedents_gmo?: {
    genetique?: string;
    mode_vie?: string;
    per_os?: string;
  };
  antecedents_che?: {
    curriculum_vitae?: string;
    hospitalisation?: string;
    niveau_socio_economique?: string;
  };
  
  // IV. Examen Général
  examen_general?: {
    etat_general?: string;
    conscience?: string;
    poids?: number;
    taille?: number;
    imc?: number;
    temperature?: number;
    frequence_respiratoire?: number;
    frequence_cardiaque?: number;
    tension_arterielle_gauche?: string;
    tension_arterielle_droite?: string;
    saturation_oxygene?: number;
    diurese?: string;
    tour_taille?: number;
  };
  
  // V. Examen Physique - Groupe Central
  examen_physique_central?: {
    choc_pointe?: string;
    bdc?: string;
    souffles?: string;
    pouls_peripheriques?: string;
    veines_jugulaires?: string;
    appareil_respiratoire?: string;
    foie?: string;
  };
  
  // VI. Examen Physique - Groupe Périphérique
  examen_physique_peripherique?: {
    conjonctives_muqueuses?: string;
    etat_bucco_dentaire?: string;
    masse_cervicale?: string;
    abdomen?: string;
    masse_palpee?: string;
    membres_inferieurs_omi?: string;
    mollets?: string;
    extremites?: string;
    autres?: string;
  };
  
  // VII. Synthèse
  resume_syndromique?: string;
  hypotheses_diagnostiques?: string;
  cat?: string;
  resultats_examens_paracliniques?: string;
  diagnostic_retenu?: string;
  evolution_quotidienne?: string;
  
  // Métadonnées
  medecin: string;
  created_at: Date;
  updated_at: Date;
}