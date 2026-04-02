import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (allowedRoles: string | string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      // 1. On définit d'abord les variables de comparaison
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = req.user.role; 

      // 2. MAINTENANT le log fonctionnera car rolesArray existe
      console.log(
        '🔑 [roleMiddleware] user:', 
        req.user?.email, 
        '| role:', 
        userRole, 
        '| required:', 
        rolesArray
      );

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Aucun rôle défini pour cet utilisateur'
        });
      }

      // 3. Normalisation pour éviter les erreurs de casse (Majuscules/Minuscules)
      const normalizedUserRole = String(userRole).trim().toLowerCase();
      const normalizedAllowedRoles = rolesArray.map(r => String(r).trim().toLowerCase());

      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        console.warn(`[Perms] Accès refusé pour ${req.user.email}. Rôle: ${userRole}`);
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