// backend/src/interfaces/http/validators/auth.validator.ts
//
// CHANGEMENT : registerSchema retire. Ne servait qu'a la route POST /auth/register,
// supprimee (voir auth.routes.ts). Si un jour un formulaire d'inscription publique
// legitime est requis, recreer un schema dedie a ce moment-la plutot que de
// restaurer celui-ci tel quel : il acceptait un role libre, ce qui etait
// justement le probleme.

import { z } from 'zod';

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

export type LoginInput = z.infer<typeof loginSchema>;