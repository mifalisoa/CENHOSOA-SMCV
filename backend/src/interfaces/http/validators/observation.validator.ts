import { z } from 'zod';

// Schéma de base commun
const baseObservationSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),
  date_observation: z.string().datetime().or(z.date()),
  heure_observation: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  
  histoire_maladie: z.string().optional(),
  
  antecedents_cmo: z.object({
    chirurgicaux: z.string().optional(),
    medicaux: z.string().optional(),
    gyneco_obstetricaux: z.string().optional(),
  }).optional(),
  
  antecedents_gmo: z.object({
    genetique: z.string().optional(),
    mode_vie: z.string().optional(),
    per_os: z.string().optional(),
  }).optional(),
  
  antecedents_che: z.object({
    curriculum_vitae: z.string().optional(),
    hospitalisation: z.string().optional(),
    niveau_socio_economique: z.string().optional(),
  }).optional(),
  
  examen_general: z.object({
    etat_general: z.string().optional(),
    conscience: z.string().optional(),
    poids: z.number().optional(),
    taille: z.number().optional(),
    imc: z.number().optional(),
    temperature: z.number().optional(),
    frequence_respiratoire: z.number().optional(),
    frequence_cardiaque: z.number().optional(),
    tension_arterielle_gauche: z.string().optional(),
    tension_arterielle_droite: z.string().optional(),
    saturation_oxygene: z.number().optional(),
    diurese: z.string().optional(),
    tour_taille: z.number().optional(),
  }).optional(),
  
  examen_physique_central: z.object({
    choc_pointe: z.string().optional(),
    bdc: z.string().optional(),
    souffles: z.string().optional(),
    pouls_peripheriques: z.string().optional(),
    veines_jugulaires: z.string().optional(),
    appareil_respiratoire: z.string().optional(),
    foie: z.string().optional(),
  }).optional(),
  
  examen_physique_peripherique: z.object({
    conjonctives_muqueuses: z.string().optional(),
    etat_bucco_dentaire: z.string().optional(),
    masse_cervicale: z.string().optional(),
    abdomen: z.string().optional(),
    masse_palpee: z.string().optional(),
    membres_inferieurs_omi: z.string().optional(),
    mollets: z.string().optional(),
    extremites: z.string().optional(),
    autres: z.string().optional(),
  }).optional(),
  
  resume_syndromique: z.string().optional(),
  hypotheses_diagnostiques: z.string().optional(),
  cat: z.string().optional(),
  resultats_examens_paracliniques: z.string().optional(),
  diagnostic_retenu: z.string().optional(),
  evolution_quotidienne: z.string().optional(),
  
  medecin: z.string().min(1, "Le médecin est requis"),
});

// Schéma pour patient EXTERNE
export const createObservationExterneSchema = baseObservationSchema.extend({
  type_observation: z.literal('externe'),
  motif_consultation: z.string().optional(),
});

// Schéma pour patient HOSPITALISÉ
export const createObservationHospitaliseSchema = baseObservationSchema.extend({
  type_observation: z.literal('hospitalise'),
  motif_hospitalisation: z.string().optional(),
  date_entree: z.string().datetime().or(z.date()).optional(),
  diagnostic_entree: z.string().optional(),
  date_transeat: z.string().datetime().or(z.date()).optional(),
  date_sortie: z.string().datetime().or(z.date()).optional(),
  diagnostic_sortie: z.string().optional(),
});

// Union des deux schémas pour la création
export const createObservationSchema = z.discriminatedUnion('type_observation', [
  createObservationExterneSchema,
  createObservationHospitaliseSchema,
]);

// ✅ CORRECTION : Schéma pour la mise à jour (sans discriminatedUnion)
export const updateObservationSchema = z.object({
  type_observation: z.enum(['externe', 'hospitalise']).optional(),
  date_observation: z.string().datetime().or(z.date()).optional(),
  heure_observation: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  
  // Champs communs (tous optionnels)
  motif_consultation: z.string().optional(),
  motif_hospitalisation: z.string().optional(),
  histoire_maladie: z.string().optional(),
  
  // Champs hospitalisation
  date_entree: z.string().datetime().or(z.date()).optional(),
  diagnostic_entree: z.string().optional(),
  date_transeat: z.string().datetime().or(z.date()).optional(),
  date_sortie: z.string().datetime().or(z.date()).optional(),
  diagnostic_sortie: z.string().optional(),
  
  // Antécédents
  antecedents_cmo: z.object({
    chirurgicaux: z.string().optional(),
    medicaux: z.string().optional(),
    gyneco_obstetricaux: z.string().optional(),
  }).optional(),
  
  antecedents_gmo: z.object({
    genetique: z.string().optional(),
    mode_vie: z.string().optional(),
    per_os: z.string().optional(),
  }).optional(),
  
  antecedents_che: z.object({
    curriculum_vitae: z.string().optional(),
    hospitalisation: z.string().optional(),
    niveau_socio_economique: z.string().optional(),
  }).optional(),
  
  // Examens
  examen_general: z.object({
    etat_general: z.string().optional(),
    conscience: z.string().optional(),
    poids: z.number().optional(),
    taille: z.number().optional(),
    imc: z.number().optional(),
    temperature: z.number().optional(),
    frequence_respiratoire: z.number().optional(),
    frequence_cardiaque: z.number().optional(),
    tension_arterielle_gauche: z.string().optional(),
    tension_arterielle_droite: z.string().optional(),
    saturation_oxygene: z.number().optional(),
    diurese: z.string().optional(),
    tour_taille: z.number().optional(),
  }).optional(),
  
  examen_physique_central: z.object({
    choc_pointe: z.string().optional(),
    bdc: z.string().optional(),
    souffles: z.string().optional(),
    pouls_peripheriques: z.string().optional(),
    veines_jugulaires: z.string().optional(),
    appareil_respiratoire: z.string().optional(),
    foie: z.string().optional(),
  }).optional(),
  
  examen_physique_peripherique: z.object({
    conjonctives_muqueuses: z.string().optional(),
    etat_bucco_dentaire: z.string().optional(),
    masse_cervicale: z.string().optional(),
    abdomen: z.string().optional(),
    masse_palpee: z.string().optional(),
    membres_inferieurs_omi: z.string().optional(),
    mollets: z.string().optional(),
    extremites: z.string().optional(),
    autres: z.string().optional(),
  }).optional(),
  
  // Synthèse
  resume_syndromique: z.string().optional(),
  hypotheses_diagnostiques: z.string().optional(),
  cat: z.string().optional(),
  resultats_examens_paracliniques: z.string().optional(),
  diagnostic_retenu: z.string().optional(),
  evolution_quotidienne: z.string().optional(),
  
  medecin: z.string().optional(),
});

export type CreateObservationDTO = z.infer<typeof createObservationSchema>;
export type UpdateObservationDTO = z.infer<typeof updateObservationSchema>;