import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id_utilisateur: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware de vérification des rôles
 * Accepte un tableau de rôles autorisés
 */
export const roleMiddleware = (allowedRoles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Convertir en tableau si c'est une string
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Vérifier si le rôle de l'utilisateur est autorisé
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Permissions insuffisantes',
          required_roles: roles,
          your_role: req.user.role,
        });
      }

      next();
    } catch (error) {
      console.error('Erreur roleMiddleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification des rôles',
      });
    }
  };
};