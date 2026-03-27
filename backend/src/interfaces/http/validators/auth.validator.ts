// backend/src/interfaces/http/validators/auth.validator.ts

import { z } from 'zod';

const ROLES = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier', 'secretaire'] as const;

export const loginSchema = z.object({
  body: z.object({
    email:        z.string().email('Email invalide').optional(),
    email_user:   z.string().email('Email invalide').optional(),
    password:     z.string().min(6).optional(),
    mot_de_passe: z.string().min(6).optional(),
  })
  .refine(d => d.email || d.email_user,      { message: 'Email requis',        path: ['email']    })
  .refine(d => d.password || d.mot_de_passe, { message: 'Mot de passe requis', path: ['password'] })
});

export const registerSchema = z.object({
  body: z.object({
    email:        z.string().email().optional(),
    email_user:   z.string().email().optional(),
    password:     z.string().min(6).optional(),
    mot_de_passe: z.string().min(6).optional(),
    nom:          z.string().min(2).optional(),
    nom_user:     z.string().min(2).optional(),
    prenom:       z.string().min(2).optional(),
    prenom_user:  z.string().min(2).optional(),
    role:         z.enum(ROLES).optional(),
    role_user:    z.enum(ROLES).optional(),
    specialite:   z.string().optional(),
    telephone:    z.string().optional(),
  })
  .refine(d => d.email || d.email_user,      { message: 'Email requis',        path: ['email']    })
  .refine(d => d.password || d.mot_de_passe, { message: 'Mot de passe requis', path: ['password'] })
  .refine(d => d.nom || d.nom_user,          { message: 'Nom requis',          path: ['nom']      })
  .refine(d => d.prenom || d.prenom_user,    { message: 'Prénom requis',       path: ['prenom']   })
  .refine(d => d.role || d.role_user,        { message: 'Rôle requis',         path: ['role']     })
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;