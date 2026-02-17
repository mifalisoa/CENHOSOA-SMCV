import { z } from 'zod';

export const patientSchema = z.object({
  num_dossier: z.string().min(1, 'Le numéro de dossier est requis'),
  nom_patient: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom_patient: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)'),
  sexe_patient: z.enum(['M', 'F'], { message: 'Veuillez sélectionner un sexe' }),
  adresse_patient: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  tel_patient: z.string().optional(),
  profession: z.string().optional(),
  groupe_sanguin: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  taille_patient: z.number().positive().optional(),
  poids_patient: z.number().positive().optional(),
  allergies: z.string().optional(),
  antecedents: z.string().optional(),
  assurance: z.string().optional(),
  num_assurance: z.string().optional(),
  personne_contact: z.string().min(2, 'Le contact d\'urgence est requis'),
  tel_urgence: z.string().min(10, 'Le numéro d\'urgence est requis'),
  statut_patient: z.enum(['externe', 'hospitalisé', 'sorti']).default('externe'),
});

export type PatientFormData = z.infer<typeof patientSchema>;