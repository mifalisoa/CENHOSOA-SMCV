import { z } from 'zod';

export const createAdmissionSchema = z.object({
    id_patient: z.number().int().positive('ID patient invalide'),
    id_docteur: z.number().int().positive('ID docteur invalide'),
    id_secretaire: z.number().int().positive('ID secrétaire invalide'),
    id_lit: z.number().int().positive().optional(),
    motif_admission: z.string().min(5, 'Le motif doit contenir au moins 5 caractères'),
    diagnostic_entree: z.string().min(5, 'Le diagnostic doit contenir au moins 5 caractères'),
    type_admission: z.enum(['urgence', 'programmée', 'transfert'], {
        message: 'Type d\'admission invalide',
    }),
    statut_admission: z.enum(['en_cours', 'sortie'], {
        message: 'Statut invalide',
    }).default('en_cours'),
    date_sortie_prevue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    remarques_admission: z.string().optional(),
});

export const updateAdmissionSchema = z.object({
    id_lit: z.number().int().positive().optional(),
    motif_admission: z.string().min(5).optional(),
    diagnostic_entree: z.string().min(5).optional(),
    type_admission: z.enum(['urgence', 'programmée', 'transfert']).optional(),
    date_sortie_prevue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    remarques_admission: z.string().optional(),
});

export const assignLitSchema = z.object({
    id_lit: z.number().int().positive('ID lit invalide'),
});

export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>;
export type AssignLitInput = z.infer<typeof assignLitSchema>;