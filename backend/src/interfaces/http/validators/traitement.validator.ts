import { z } from 'zod';

const baseTraitementSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),

  // ✅ FIX 1 : accepte "YYYY-MM-DD" ET le format ISO complet
  date_prescription: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD")
    .or(z.string().datetime())
    .or(z.date()),

  heure_prescription: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),

  type_document: z.enum(['ordonnance', 'traitement']),

  medicament: z.string().min(1, "Le médicament est requis"),
  dosage: z.string().min(1, "Le dosage est requis"),
  voie_administration: z.string().min(1, "La voie d'administration est requise"),
  frequence: z.string().min(1, "La fréquence est requise"),
  duree: z.string().min(1, "La durée est requise"),
  instructions: z.string().optional(),
});

const traitementSimpleSchema = baseTraitementSchema.extend({
  type_document: z.literal('traitement'),
  diagnostic: z.string().optional(),
  prescripteur: z.string().optional(),
  lieu_prescription: z.string().optional(),
  observations_speciales: z.string().optional(),
});

const traitementOrdonnanceSchema = baseTraitementSchema.extend({
  type_document: z.literal('ordonnance'),
  diagnostic: z.string().optional(),
  // ✅ FIX 2 : prescripteur optionnel (le formulaire ne l'impose pas)
  prescripteur: z.string().optional(),
  lieu_prescription: z.string().optional(),
  observations_speciales: z.string().optional(),
});

export const createTraitementSchema = z.discriminatedUnion('type_document', [
  traitementSimpleSchema,
  traitementOrdonnanceSchema,
]);

export const updateTraitementSchema = z.object({
  date_prescription: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .or(z.string().datetime())
    .or(z.date())
    .optional(),
  heure_prescription: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  type_document: z.enum(['ordonnance', 'traitement']).optional(),
  diagnostic: z.string().optional(),
  prescripteur: z.string().optional(),
  lieu_prescription: z.string().optional(),
  medicament: z.string().optional(),
  dosage: z.string().optional(),
  voie_administration: z.string().optional(),
  frequence: z.string().optional(),
  duree: z.string().optional(),
  instructions: z.string().optional(),
  observations_speciales: z.string().optional(),
});

export type CreateTraitementDTO = z.infer<typeof createTraitementSchema>;
export type UpdateTraitementDTO = z.infer<typeof updateTraitementSchema>;