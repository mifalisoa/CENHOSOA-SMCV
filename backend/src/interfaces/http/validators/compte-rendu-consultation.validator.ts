import { z } from 'zod';

export const createCompteRenduConsultationSchema = z.object({
  id_patient: z.number().int().positive(),

  date_consultation: z.string().datetime().or(z.date()),
  motif_consultation: z.string().min(1, 'Le motif de consultation est requis'),

  contexte: z.string().optional(),
  examens_paracliniques: z.string().optional(),
  diagnostic: z.string().min(1, 'Le diagnostic est requis'),
  traitement: z.string().min(1, 'Le traitement est requis'),
  evolution: z.string().optional(),
  prochain_rdv: z.string().optional(),

  medecin: z.string().optional(), // optionnel — toujours ecrase par req.user cote controleur
});

export const updateCompteRenduConsultationSchema = z.object({
  date_consultation: z.string().datetime().or(z.date()).optional(),
  motif_consultation: z.string().optional(),

  contexte: z.string().optional(),
  examens_paracliniques: z.string().optional(),
  diagnostic: z.string().optional(),
  traitement: z.string().optional(),
  evolution: z.string().optional(),
  prochain_rdv: z.string().optional(),

  medecin: z.string().optional(),
});

export type CreateCompteRenduConsultationDTO = z.infer<typeof createCompteRenduConsultationSchema>;
export type UpdateCompteRenduConsultationDTO = z.infer<typeof updateCompteRenduConsultationSchema>;