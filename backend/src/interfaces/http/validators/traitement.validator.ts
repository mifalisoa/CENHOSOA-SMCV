import { z } from 'zod';

const baseTraitementSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),
  
  date_prescription: z.string().datetime().or(z.date()),
  heure_prescription: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  
  type_document: z.enum(['ordonnance', 'traitement']),
  
  medicament: z.string().min(1, "Le médicament est requis"),
  dosage: z.string().min(1, "Le dosage est requis"),
  voie_administration: z.string().min(1, "La voie d'administration est requise"),
  frequence: z.string().min(1, "La fréquence est requise"),
  duree: z.string().min(1, "La durée est requise"),
  instructions: z.string().optional(),
});

// Traitement simple
const traitementSimpleSchema = baseTraitementSchema.extend({
  type_document: z.literal('traitement'),
});

// Ordonnance (nécessite prescripteur)
const traitementOrdonnanceSchema = baseTraitementSchema.extend({
  type_document: z.literal('ordonnance'),
  diagnostic: z.string().optional(),
  prescripteur: z.string().min(1, "Le prescripteur est requis pour une ordonnance"),
  lieu_prescription: z.string().optional(),
  observations_speciales: z.string().optional(),
});

// Union des deux schémas pour la création
export const createTraitementSchema = z.discriminatedUnion('type_document', [
  traitementSimpleSchema,
  traitementOrdonnanceSchema,
]);

// ✅ CORRECTION : Schéma pour la mise à jour (tous les champs optionnels)
export const updateTraitementSchema = z.object({
  date_prescription: z.string().datetime().or(z.date()).optional(),
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