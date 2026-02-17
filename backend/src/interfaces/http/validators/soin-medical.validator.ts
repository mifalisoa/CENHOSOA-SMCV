import { z } from 'zod';

export const createSoinMedicalSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),
  
  date_soin: z.string().datetime().or(z.date()),
  heure_soin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  
  // Au moins un type de soin doit être renseigné
  ett: z.string().optional(),
  eto: z.string().optional(),
  autre: z.string().optional(),
  
  realise_par: z.string().min(1, "Le médecin réalisateur est requis"),
  verifie: z.boolean().optional().default(false),
}).refine(
  data => data.ett || data.eto || data.autre,
  { message: "Au moins un type de soin (ETT, ETO ou Autre) doit être renseigné" }
);

// ✅ CORRECTION : Schéma pour la mise à jour (sans .refine())
export const updateSoinMedicalSchema = z.object({
  date_soin: z.string().datetime().or(z.date()).optional(),
  heure_soin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  
  ett: z.string().optional(),
  eto: z.string().optional(),
  autre: z.string().optional(),
  
  realise_par: z.string().optional(),
  verifie: z.boolean().optional(),
});

export type CreateSoinMedicalDTO = z.infer<typeof createSoinMedicalSchema>;
export type UpdateSoinMedicalDTO = z.infer<typeof updateSoinMedicalSchema>;