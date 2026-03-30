import { z } from 'zod';

// ✅ Format date accepté : YYYY-MM-DD (input HTML) OU ISO complet OU objet Date
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD')
  .or(z.string().datetime())
  .or(z.date());

export const createSoinInfirmierSchema = z.object({
  id_patient:   z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),

  date_soin:  dateField,
  heure_soin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),

  // Types de soins (tous optionnels, mais au moins un requis)
  ecg:          z.string().optional(),
  ecg_dii_long: z.string().optional(),
  injection_iv: z.string().optional(),
  injection_im: z.string().optional(),
  pse:          z.string().optional(),
  pansement:    z.string().optional(),
  autre_soins:  z.string().optional(),

  realise_par: z.string().min(1, "L'infirmier réalisateur est requis"),
  verifie:     z.boolean().optional().default(false),
}).refine(
  data => data.ecg || data.ecg_dii_long || data.injection_iv || data.injection_im ||
          data.pse || data.pansement || data.autre_soins,
  { message: 'Au moins un type de soin doit être renseigné' }
);

export const updateSoinInfirmierSchema = z.object({
  date_soin:  dateField.optional(),
  heure_soin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),

  ecg:          z.string().optional(),
  ecg_dii_long: z.string().optional(),
  injection_iv: z.string().optional(),
  injection_im: z.string().optional(),
  pse:          z.string().optional(),
  pansement:    z.string().optional(),
  autre_soins:  z.string().optional(),

  realise_par: z.string().optional(),
  verifie:     z.boolean().optional(),
});

export type CreateSoinInfirmierDTO = z.infer<typeof createSoinInfirmierSchema>;
export type UpdateSoinInfirmierDTO = z.infer<typeof updateSoinInfirmierSchema>;