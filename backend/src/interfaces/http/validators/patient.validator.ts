import { z } from 'zod';

/**
 * Schéma de création de patient - SIMPLIFIÉ (8 champs essentiels)
 */
export const createPatientSchema = z.object({
  body: z.object({
    nom_patient: z.string().min(1, 'Le nom est requis').max(100),
    prenom_patient: z.string().min(1, 'Le prénom est requis').max(100),
    date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    sexe_patient: z.enum(['M', 'F'], {
      message: 'Le sexe est requis (M ou F)'
    }),
    adresse_patient: z.string().min(1, "L'adresse est requise").max(250),
    tel_patient: z.string().max(20).optional(),
    assurance: z.string().max(100).optional(),
    medecin_traitant: z.string().min(1, 'Le médecin traitant est requis').max(150),
    // ✅ Accepte 'hospitalise' et 'hospitalisé', convertit automatiquement
    statut_patient: z.string().optional().refine(
      (val) => !val || ['externe', 'hospitalisé', 'hospitalise'].includes(val),
      { message: 'Le statut doit être externe ou hospitalisé' }
    ).transform((val) => {
      // Normaliser : convertir 'hospitalise' en 'hospitalisé'
      if (val === 'hospitalise') return 'hospitalisé';
      return val;
    }),
  }),
});

/**
 * Schéma de mise à jour de patient
 */
export const updatePatientSchema = z.object({
  body: z.object({
    nom_patient: z.string().min(1).max(100).optional(),
    prenom_patient: z.string().min(1).max(100).optional(),
    date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sexe_patient: z.enum(['M', 'F']).optional(),
    adresse_patient: z.string().max(250).optional(),
    tel_patient: z.string().max(20).optional(),
    assurance: z.string().max(100).optional(),
    medecin_traitant: z.string().max(150).optional(),
    // ✅ Accepte aussi 'hospitalise' et 'hospitalisé'
    statut_patient: z.string().optional().refine(
      (val) => !val || ['externe', 'hospitalisé', 'hospitalise', 'sorti'].includes(val),
      { message: 'Le statut doit être externe, hospitalisé ou sorti' }
    ).transform((val) => {
      // Normaliser : convertir 'hospitalise' en 'hospitalisé'
      if (val === 'hospitalise') return 'hospitalisé';
      return val;
    }),
  }),
});