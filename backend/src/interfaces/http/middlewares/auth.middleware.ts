// backend/src/interfaces/http/middlewares/auth.middleware.ts
//
// CHANGEMENT : verifie maintenant reellement sessions_actives.expires_at,
// en plus de la signature du JWT et du statut de l'utilisateur. Avant ce
// correctif, le "delai de session" configurable dans le dashboard Securite
// etait calcule et stocke mais n'avait aucun effet sur l'acces reel -- seul
// le JWT (duree fixe, 24h par defaut) gouvernait la deconnexion.
//
// session_id = le token JWT lui-meme (voir createSession, appele avec
// result.token dans AuthController.login).

import { Request, Response, NextFunction } from 'express';
import { JwtService }       from '../../../infrastructure/security/jwt.service';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';
import { pool }             from '../../../config/database';
import { updateSessionActivity } from './action-logger.middleware';

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

    const userResult = await pool.query(
      `SELECT id_user, email, role, nom, prenom
       FROM utilisateurs
       WHERE id_user = $1 AND statut = 'actif'`,
      [payload.id_user]
    );

    if (userResult.rows.length === 0) {
      throw new UnauthorizedError('Utilisateur non trouvé ou inactif');
    }

    // Verifie que la session existe encore et n'a pas expire. Une session
    // absente ici veut dire soit qu'elle a ete supprimee manuellement
    // (bouton "Deconnecter" du dashboard Securite -- maintenant reellement
    // effectif), soit qu'elle n'a jamais ete creee correctement au login.
    const sessionResult = await pool.query(
      `SELECT expires_at FROM sessions_actives WHERE session_id = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      throw new UnauthorizedError('Session introuvable, veuillez vous reconnecter');
    }

    if (new Date(sessionResult.rows[0].expires_at) < new Date()) {
      await pool.query(`DELETE FROM sessions_actives WHERE session_id = $1`, [token]);
      throw new UnauthorizedError('Session expirée, veuillez vous reconnecter');
    }

    req.user = userResult.rows[0];

    // Prolonge la session (timeout glissant) en arriere-plan. Ne bloque
    // jamais la requete en cours si ca echoue -- deja concu comme
    // best-effort dans updateSessionActivity elle-meme.
    updateSessionActivity(token).catch(() => {});

    next();
  } catch (error) {
    next(error);
  }
};