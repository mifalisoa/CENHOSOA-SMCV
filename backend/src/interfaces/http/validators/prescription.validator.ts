import { z } from 'zod';

export const createPrescriptionSchema = z.object({
    id_admission: z.number().int().positive('ID admission invalide'),
    id_docteur: z.number().int().positive('ID docteur invalide'),
    type_prescription: z.enum(['médicament', 'bilan', 'soin'], {
        message: 'Type de prescription invalide',
    }),
    nom_medicament: z.string().optional(),
    dosage: z.string().optional(),
    voie_administration: z.enum(['orale', 'IV', 'IM', 'SC', 'cutanée'], {
        message: 'Voie d\'administration invalide',
    }).optional(),
    frequence: z.string().optional(),
    duree_traitement: z.string().optional(),
    nom_bilan: z.string().optional(),
    indication_bilan: z.string().optional(),
    instructions: z.string().optional(),
    modifications_traitement: z.string().optional(),
}).refine(
    (data) => {
        // Si type = médicament, nom_medicament est requis
        if (data.type_prescription === 'médicament' && !data.nom_medicament) {
            return false;
        }
        // Si type = bilan, nom_bilan est requis
        if (data.type_prescription === 'bilan' && !data.nom_bilan) {
            return false;
        }
        return true;
    },
    {
        message: 'Les champs requis selon le type de prescription sont manquants',
    }
);

export const updatePrescriptionSchema = z.object({
    type_prescription: z.enum(['médicament', 'bilan', 'soin']).optional(),
    nom_medicament: z.string().optional(),
    dosage: z.string().optional(),
    voie_administration: z.enum(['orale', 'IV', 'IM', 'SC', 'cutanée']).optional(),
    frequence: z.string().optional(),
    duree_traitement: z.string().optional(),
    nom_bilan: z.string().optional(),
    indication_bilan: z.string().optional(),
    instructions: z.string().optional(),
    modifications_traitement: z.string().optional(),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;