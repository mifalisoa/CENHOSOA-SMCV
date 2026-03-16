// backend/src/interfaces/http/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (allowedRoles: string | string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const userRole = req.user.role;   // était req.user.role_user || req.user.role

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Aucun rôle défini pour cet utilisateur'
        });
      }

      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const normalizedUserRole = String(userRole).trim().toLowerCase();
      const normalizedAllowedRoles = rolesArray.map(r => r.trim().toLowerCase());

      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        console.warn(`[Perms] Accès refusé pour ${req.user.email}. Rôle: ${userRole}`); // était email_user
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes',
          debug: { current: userRole, required: rolesArray }
        });
      }

      next();
    } catch (error) {
      console.error('Erreur roleMiddleware:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur (permissions)' });
    }
  };
};