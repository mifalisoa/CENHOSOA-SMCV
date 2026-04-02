// backend/src/interfaces/http/middlewares/permission.middleware.ts
//
// Vérifie qu'un utilisateur a la permission requise pour accéder à une route.
// Fonctionne en deux étapes :
//   1. Si l'utilisateur a des permissions personnalisées en base → les utilise
//   2. Sinon → utilise les permissions par défaut de son rôle
//
// Usage dans une route :
//   router.post('/', authMiddleware, permissionMiddleware('soins-infirmiers.write'), controller.create);

import { Response, NextFunction }                   from 'express';
import { AuthRequest }                              from './auth.middleware';
import { PostgresUserPermissionsRepository }        from '../../../infrastructure/database/postgres/repositories/PostgresUserPermissionsRepository';
import { pool }                                     from '../../../config/database';

const permissionsRepo = new PostgresUserPermissionsRepository(pool);

export const permissionMiddleware = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié' });
        return;
      }

      const { id_user, role, email } = req.user;

      // Admin a toujours tous les droits
      if (role === 'admin') { next(); return; }

      const allowed = await permissionsRepo.hasPermission(id_user, role, requiredPermission);

      if (!allowed) {
        console.warn(
          `🚫 [Permission] Accès refusé — user: ${email} | role: ${role} | permission requise: ${requiredPermission}`
        );
        res.status(403).json({
          success: false,
          message: `Permission insuffisante — "${requiredPermission}" requise`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[permissionMiddleware] Erreur:', error);
      res.status(500).json({ success: false, message: 'Erreur vérification permissions' });
    }
  };
};