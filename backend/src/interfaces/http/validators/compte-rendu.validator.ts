import { z } from 'zod';

export const createCompteRenduSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive(),

  date_admission: z.string().datetime().or(z.date()),
  date_sortie: z.string().datetime().or(z.date()),

  contexte: z.string().optional(),
  resume_observation: z.string().min(1, "Le résumé de l'observation est requis"),
  examens_paracliniques: z.string().optional(),
  diagnostic: z.string().min(1, "Le diagnostic est requis"),
  traitement_sortie: z.string().min(1, "Le traitement de sortie est requis"),
  evolution: z.string().optional(),
  prochain_rdv: z.string().optional(),

  medecin: z.string().optional(),
});

export const updateCompteRenduSchema = z.object({
  date_admission: z.string().datetime().or(z.date()).optional(),
  date_sortie: z.string().datetime().or(z.date()).optional(),

  contexte: z.string().optional(),
  resume_observation: z.string().optional(),
  examens_paracliniques: z.string().optional(),
  diagnostic: z.string().optional(),
  traitement_sortie: z.string().optional(),
  evolution: z.string().optional(),
  prochain_rdv: z.string().optional(),

  medecin: z.string().optional(),
});

export type CreateCompteRenduDTO = z.infer<typeof createCompteRenduSchema>;
export type UpdateCompteRenduDTO = z.infer<typeof updateCompteRenduSchema>;