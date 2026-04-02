// backend/src/interfaces/http/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { JwtService }       from '../../../infrastructure/security/jwt.service';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';
import { pool }             from '../../../config/database';

export interface AuthRequest extends Request {
  user?: {
    id_user: number;
    email:   string;
    role:    string;
    nom:     string;
    prenom:  string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token manquant');
    }

    const token   = authHeader.substring(7);
    const payload = JwtService.verifyToken(token);

    // ✅ Lit le rôle réel depuis la base — évite les tokens avec rôle périmé
    const result = await pool.query(
      `SELECT id_user, email, role, nom, prenom
       FROM utilisateurs
       WHERE id_user = $1 AND statut = 'actif'`,
      [payload.id_user]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Utilisateur non trouvé ou inactif');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};