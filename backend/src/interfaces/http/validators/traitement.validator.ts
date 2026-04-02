import { z } from 'zod';

// ── Schéma de date réutilisable ───────────────────────────────────────────────
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD')
  .or(z.string().datetime())
  .or(z.date());

const heureSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

// ── Schéma d'un médicament individuel ────────────────────────────────────────
export const medicamentSchema = z.object({
  medicament:          z.string().min(1, 'Le médicament est requis'),
  dosage:              z.string().min(1, 'Le dosage est requis'),
  voie_administration: z.string().min(1, "La voie d'administration est requise"),
  frequence:           z.string().min(1, 'La fréquence est requise'),
  duree:               z.string().min(1, 'La durée est requise'),
  instructions:        z.string().optional(),
});

// ── Informations communes à une ordonnance ────────────────────────────────────
const ordonnanceBaseSchema = z.object({
  id_patient:              z.number().int().positive(),
  id_admission:            z.number().int().positive().optional(),
  date_prescription:       dateSchema,
  heure_prescription:      heureSchema,
  type_document:           z.enum(['ordonnance', 'traitement']),
  diagnostic:              z.string().optional(),
  prescripteur:            z.string().optional(),
  lieu_prescription:       z.string().optional(),
  observations_speciales:  z.string().optional(),
});

// ── Schéma création multiple (nouvelle route) ─────────────────────────────────
// Body : { ...infosCommunes, medicaments: [...] }
export const createManyTraitementsSchema = ordonnanceBaseSchema.extend({
  medicaments: z
    .array(medicamentSchema)
    .min(1, 'Au moins un médicament est requis')
    .max(20, 'Maximum 20 médicaments par ordonnance'),
});

// ── Schéma création simple — rétrocompatibilité ───────────────────────────────
const baseTraitementSchema = ordonnanceBaseSchema.extend({
  medicament:          z.string().min(1, 'Le médicament est requis'),
  dosage:              z.string().min(1, 'Le dosage est requis'),
  voie_administration: z.string().min(1, "La voie d'administration est requise"),
  frequence:           z.string().min(1, 'La fréquence est requise'),
  duree:               z.string().min(1, 'La durée est requise'),
  instructions:        z.string().optional(),
});

const traitementSimpleSchema = baseTraitementSchema.extend({
  type_document: z.literal('traitement'),
});

const traitementOrdonnanceSchema = baseTraitementSchema.extend({
  type_document: z.literal('ordonnance'),
});

export const createTraitementSchema = z.discriminatedUnion('type_document', [
  traitementSimpleSchema,
  traitementOrdonnanceSchema,
]);

// ── Schéma mise à jour ────────────────────────────────────────────────────────
export const updateTraitementSchema = z.object({
  date_prescription:      dateSchema.optional(),
  heure_prescription:     heureSchema.optional(),
  type_document:          z.enum(['ordonnance', 'traitement']).optional(),
  diagnostic:             z.string().optional(),
  prescripteur:           z.string().optional(),
  lieu_prescription:      z.string().optional(),
  medicament:             z.string().optional(),
  dosage:                 z.string().optional(),
  voie_administration:    z.string().optional(),
  frequence:              z.string().optional(),
  duree:                  z.string().optional(),
  instructions:           z.string().optional(),
  observations_speciales: z.string().optional(),
});

// ── Types exportés ────────────────────────────────────────────────────────────
export type CreateTraitementDTO      = z.infer<typeof createTraitementSchema>;
export type CreateManyTraitementsDTO = z.infer<typeof createManyTraitementsSchema>;
export type UpdateTraitementDTO      = z.infer<typeof updateTraitementSchema>;