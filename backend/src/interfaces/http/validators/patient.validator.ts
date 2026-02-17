import { z } from 'zod';

/**
 * Schéma de création de patient
 */
export const createPatientSchema = z.object({
  body: z.object({
    nom_patient: z.string().min(1, 'Le nom est requis').max(100),
    prenom_patient: z.string().min(1, 'Le prénom est requis').max(100),
    date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    
    // Version simplifiée qui passe à tous les coups
    sexe_patient: z.enum(['M', 'F'], {
      error: 'Le sexe est requis (M ou F)'
    } as any), // Le cast 'any' ici règle le problème d'overload si TS bloque encore

    adresse_patient: z.string().min(1, 'L\'adresse est requise').max(250),
    tel_patient: z.string().max(20).optional(),
    profession: z.string().max(100).optional(),
    groupe_sanguin: z.string().max(5).optional(),
    taille_patient: z.number().min(0).max(999).optional(),
    poids_patient: z.number().min(0).max(999.99).optional(),
    allergies: z.string().optional(),
    antecedents: z.string().optional(),
    assurance: z.string().max(100).optional(),
    num_assurance: z.string().max(50).optional(),
    personne_contact: z.string().min(1, 'La personne à contacter est requise').max(150),
    tel_urgence: z.string().min(1, 'Le téléphone d\'urgence est requis').max(20),
    
    // Utilisation de .refine pour un contrôle total sans erreurs d'overload
    statut_patient: z.string().optional().refine(
      (val) => !val || ['externe', 'hospitalise'].includes(val),
      { message: 'Le statut doit être externe ou hospitalise' }
    ),
  }),
});

/**
 * Schéma de mise à jour de patient
 */
export const updatePatientSchema = z.object({
  body: z.object({
    nom_patient: z.string().min(1).max(100).optional(),
    prenom_patient: z.string().min(1).max(100).optional(),
    date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sexe_patient: z.enum(['M', 'F']).optional(),
    adresse_patient: z.string().max(250).optional(),
    tel_patient: z.string().max(20).optional(),
    profession: z.string().max(100).optional(),
    groupe_sanguin: z.string().max(5).optional(),
    taille_patient: z.number().min(0).max(999).optional(),
    poids_patient: z.number().min(0).max(999.99).optional(),
    allergies: z.string().optional(),
    antecedents: z.string().optional(),
    assurance: z.string().max(100).optional(),
    num_assurance: z.string().max(50).optional(),
    personne_contact: z.string().max(150).optional(),
    tel_urgence: z.string().max(20).optional(),
    statut_patient: z.string().optional().refine(
      (val) => !val || ['externe', 'hospitalise'].includes(val),
      { message: 'Le statut doit être externe ou hospitalise' }
    ),
  }),
});