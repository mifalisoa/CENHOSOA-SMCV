import { z } from 'zod';

const baseCompteRenduSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive(),
  
  date_admission: z.string().datetime().or(z.date()),
  date_sortie: z.string().datetime().or(z.date()),
  
  resume_observation: z.string().min(1, "Le résumé de l'observation est requis"),
  diagnostic_sortie: z.string().min(1, "Le diagnostic de sortie est requis"),
  traitement_sortie: z.string().min(1, "Le traitement de sortie est requis"),
  prochain_rdv: z.string().optional(),
  
  modalite_sortie: z.enum(['gueri', 'ameliore', 'transfert', 'deces']),
  
  medecin: z.string().min(1, "Le médecin est requis"),
});

// Schéma pour sortie standard (guéri, amélioré, décès)
const compteRenduStandardSchema = baseCompteRenduSchema.extend({
  modalite_sortie: z.enum(['gueri', 'ameliore', 'deces']),
});

// Schéma pour sortie avec transfert (lieu_transfert requis)
const compteRenduTransfertSchema = baseCompteRenduSchema.extend({
  modalite_sortie: z.literal('transfert'),
  lieu_transfert: z.string().min(1, "Le lieu de transfert est requis pour une sortie en transfert"),
});

// Union des schémas pour la création
export const createCompteRenduSchema = z.discriminatedUnion('modalite_sortie', [
  compteRenduStandardSchema.extend({ modalite_sortie: z.literal('gueri') }),
  compteRenduStandardSchema.extend({ modalite_sortie: z.literal('ameliore') }),
  compteRenduStandardSchema.extend({ modalite_sortie: z.literal('deces') }),
  compteRenduTransfertSchema,
]);

// ✅ CORRECTION : Schéma pour la mise à jour (sans discriminatedUnion)
export const updateCompteRenduSchema = z.object({
  date_admission: z.string().datetime().or(z.date()).optional(),
  date_sortie: z.string().datetime().or(z.date()).optional(),
  
  resume_observation: z.string().optional(),
  diagnostic_sortie: z.string().optional(),
  traitement_sortie: z.string().optional(),
  prochain_rdv: z.string().optional(),
  
  modalite_sortie: z.enum(['gueri', 'ameliore', 'transfert', 'deces']).optional(),
  lieu_transfert: z.string().optional(),
  
  medecin: z.string().optional(),
});

export type CreateCompteRenduDTO = z.infer<typeof createCompteRenduSchema>;
export type UpdateCompteRenduDTO = z.infer<typeof updateCompteRenduSchema>;