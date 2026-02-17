import { z } from 'zod';

export const createBilanBiologiqueSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),
  
  date_prelevement: z.string().datetime().or(z.date()),
  heure_prelevement: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  
  // Paramètres biologiques (tous optionnels)
  creatinine: z.number().positive().optional(),
  glycemie: z.number().positive().optional(),
  crp: z.number().nonnegative().optional(),
  inr: z.number().positive().optional(),
  nfs: z.number().positive().optional(),
  
  // Ancien format (optionnel)
  type_bilan: z.string().optional(),
  resultat: z.string().optional(),
  interpretation: z.string().optional(),
  
  // Métadonnées
  prescripteur: z.string().optional(),
  laboratoire: z.string().optional(),
});

export const updateBilanBiologiqueSchema = createBilanBiologiqueSchema
  .partial()
  .omit({ id_patient: true });