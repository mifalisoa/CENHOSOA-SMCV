// backend/src/interfaces/http/validators/auth.validator.ts

import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email:      z.string().email('Email invalide').optional(),
    email_user: z.string().email('Email invalide').optional(), // compatibilité anciens clients
    password:   z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
    mot_de_passe: z.string().min(6).optional(),
  })
  .refine(d => d.email || d.email_user,        { message: 'Email requis',          path: ['email']    })
  .refine(d => d.password || d.mot_de_passe,   { message: 'Mot de passe requis',   path: ['password'] })
});

export const registerSchema = z.object({
  body: z.object({
    // Accepter email ou email_user
    email:      z.string().email('Email invalide').optional(),
    email_user: z.string().email('Email invalide').optional(),
    password:   z.string().min(6).optional(),
    mot_de_passe: z.string().min(6).optional(),
    nom:        z.string().min(2, 'Le nom est requis').optional(),
    nom_user:   z.string().min(2).optional(),          // compatibilité
    prenom:     z.string().min(2, 'Le prénom est requis').optional(),
    prenom_user: z.string().min(2).optional(),         // compatibilité
    role: z.enum(['admin', 'medecin', 'infirmier', 'secretaire', 'pharmacien']).optional(),
    role_user: z.enum(['admin', 'medecin', 'infirmier', 'secretaire', 'pharmacien']).optional(), // compatibilité
    specialite: z.string().optional(),
    telephone:  z.string().optional(),
  })
  .refine(d => d.email || d.email_user,        { message: 'Email requis',          path: ['email']    })
  .refine(d => d.password || d.mot_de_passe,   { message: 'Mot de passe requis',   path: ['password'] })
  .refine(d => d.nom || d.nom_user,            { message: 'Nom requis',            path: ['nom']      })
  .refine(d => d.prenom || d.prenom_user,      { message: 'Prénom requis',         path: ['prenom']   })
  .refine(d => d.role || d.role_user,          { message: 'Rôle requis',           path: ['role']     })
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;