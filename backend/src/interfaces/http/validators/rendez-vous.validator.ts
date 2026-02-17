import { z } from 'zod';

export const createRendezVousSchema = z.object({
    id_patient: z.number().int().positive('ID patient invalide'),
    id_docteur: z.number().int().positive('ID docteur invalide'),
    date_rdv: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    heure_rdv: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
    duree_estimee: z.number().int().positive().default(30),
    type_rdv: z.enum(['consultation', 'suivi', 'urgence', 'controle'], {
        message: 'Type de RDV invalide',
    }).optional(),
    motif_rdv: z.string().min(5, 'Le motif doit contenir au moins 5 caractères'),
    statut_rdv: z.enum(['planifié', 'confirmé'], {
        message: 'Statut invalide',
    }).default('planifié'),
    salle: z.string().optional(),
    notes_rdv: z.string().optional(),
});

export const updateRendezVousSchema = z.object({
    date_rdv: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
    heure_rdv: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)').optional(),
    duree_estimee: z.number().int().positive().optional(),
    type_rdv: z.enum(['consultation', 'suivi', 'urgence', 'controle']).optional(),
    motif_rdv: z.string().min(5).optional(),
    salle: z.string().optional(),
    notes_rdv: z.string().optional(),
});

export const cancelRendezVousSchema = z.object({
    raison_annulation: z.string().min(5, 'La raison doit contenir au moins 5 caractères'),
});

export type CreateRendezVousInput = z.infer<typeof createRendezVousSchema>;
export type UpdateRendezVousInput = z.infer<typeof updateRendezVousSchema>;
export type CancelRendezVousInput = z.infer<typeof cancelRendezVousSchema>;