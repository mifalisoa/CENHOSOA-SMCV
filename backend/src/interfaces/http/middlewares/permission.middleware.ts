// backend/src/interfaces/http/middlewares/permission.middleware.ts
//
// LEÇON : Ce middleware remplace roleMiddleware pour les routes
// qui nécessitent une permission granulaire.
// roleMiddleware vérifie le rôle → permission.middleware vérifie la tâche.

import { Response, NextFunction } from 'express';
import { AuthRequest }                       from './auth.middleware';
import { PostgresUserPermissionsRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUserPermissionsRepository';
import { pool }                              from '../../../config/database';

const permissionsRepo = new PostgresUserPermissionsRepository(pool);

export function permissionMiddleware(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Non authentifié' });
        return;
      }

      // Admin → toujours autorisé
      if (user.role === 'admin') { next(); return; }

      const allowed = await permissionsRepo.hasPermission(user.id_user, user.role, permission);
      if (!allowed) {
        res.status(403).json({
          success: false,
          message: `Permission refusée — ${permission} requis`,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}