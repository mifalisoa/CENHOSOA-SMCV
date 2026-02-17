import { z } from 'zod';

// ✅ CORRECTION: Accepter à la fois "password" ET "mot_de_passe"
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide').optional(),
    email_user: z.string().email('Email invalide').optional(),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
    mot_de_passe: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  }).refine(
    (data) => data.email || data.email_user,
    {
      message: 'Email requis',
      path: ['email']
    }
  ).refine(
    (data) => data.password || data.mot_de_passe,
    {
      message: 'Mot de passe requis',
      path: ['password']
    }
  )
});

export const registerSchema = z.object({
  body: z.object({
    email_user: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
    mot_de_passe: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
    nom_user: z.string().min(2, 'Le nom est requis'),
    prenom_user: z.string().min(2, 'Le prénom est requis'),
    role_user: z.enum(['admin', 'docteur', 'secretaire', 'interne', 'stagiaire']),
    specialite_user: z.string().optional(),
    tel_user: z.string().optional()
  }).refine(
    (data) => data.password || data.mot_de_passe,
    {
      message: 'Mot de passe requis',
      path: ['password']
    }
  )
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;