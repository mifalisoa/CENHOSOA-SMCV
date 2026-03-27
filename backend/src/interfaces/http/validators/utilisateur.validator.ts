// backend/src/interfaces/http/validators/utilisateur.validator.ts

import { z } from 'zod';
import type { UtilisateurRole } from '../../../domain/entities/Utilisateur';

// LEÇON : Même constante que dans auth.validator.ts
// En production, on la mettrait dans un fichier partagé (shared/constants/roles.ts)
// pour éviter toute désynchronisation entre les deux validators.
const ROLES: [UtilisateurRole, ...UtilisateurRole[]] = [
  'admin',
  'medecin',
  'interne',
  'stagiaire',
  'infirmier',
  'secretaire',
];

export const createUtilisateurSchema = z.object({
  nom:          z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom:       z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email:        z.string().email('Email invalide'),
  mot_de_passe: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role:         z.enum(ROLES, { message: 'Rôle invalide' }),
  specialite:   z.string().optional(),
  telephone:    z.string().optional(),
  statut:       z.enum(['actif', 'inactif', 'suspendu']).optional(),
});

export const updateUtilisateurSchema = z.object({
  nom:        z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  prenom:     z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  email:      z.string().email('Email invalide').optional(),
  role:       z.enum(ROLES, { message: 'Rôle invalide' }).optional(),
  specialite: z.string().optional(),
  telephone:  z.string().optional(),
  statut:     z.enum(['actif', 'inactif', 'suspendu']).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
  new_password:     z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string().min(1, 'La confirmation est requise'),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path:    ['confirm_password'],
});

export type CreateUtilisateurInput = z.infer<typeof createUtilisateurSchema>;
export type UpdateUtilisateurInput = z.infer<typeof updateUtilisateurSchema>;
export type ChangePasswordInput    = z.infer<typeof changePasswordSchema>;