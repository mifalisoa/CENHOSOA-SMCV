import { z } from 'zod';

export const updateUtilisateurSchema = z.object({
    nom_user: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    prenom_user: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
    email_user: z.string().email('Email invalide').optional(),
    role_user: z.enum(['admin', 'docteur', 'secretaire'], {
        message: 'Rôle invalide',
    }).optional(),
    specialite_user: z.string().optional(),
    tel_user: z.string().optional(),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
    new_password: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirm_password: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
});

export type UpdateUtilisateurInput = z.infer<typeof updateUtilisateurSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;