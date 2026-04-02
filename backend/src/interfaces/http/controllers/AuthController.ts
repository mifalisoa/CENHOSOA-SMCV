// backend/src/interfaces/http/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { LoginUser }          from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser }       from '../../../application/use-cases/auth/RegisterUser';
import { successResponse }    from '../../../shared/utils/response.utils';
import { HTTP_STATUS }        from '../../../config/constants';
import { AuthRequest }        from '../middlewares/auth.middleware';
import { pool }               from '../../../config/database';
import { notificationService } from '../../../application/services/NotificationService';
import {
  logLoginSuccess,
  logLoginFailed,
  createSession,
  deleteSession,
} from '../middlewares/action-logger.middleware';

const ROLE_LABELS: Record<string, string> = {
  admin:      'Administrateur',
  medecin:    'Médecin',
  interne:    'Interne',
  stagiaire:  'Stagiaire',
  infirmier:  'Infirmier',
  secretaire: 'Secrétaire',
};

function getIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

export class AuthController {
  constructor(
    private loginUser:    LoginUser,
    private registerUser: RegisterUser
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    const ip        = getIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const email     = req.body.email || req.body.email_user || '';

    try {
      const loginData = {
        email,
        password: req.body.password || req.body.mot_de_passe,
      };

      const result = await this.loginUser.execute(loginData);

      // ✅ Log connexion réussie
      await logLoginSuccess(result.user.id_user, ip, userAgent);

      // ✅ Crée la session active (token JWT comme session_id)
      await createSession(result.user.id_user, result.token, req);

      // Notification aux admins (sauf si c'est un admin)
      if (result.user.role !== 'admin') {
        notificationService.notifyAdmins({
          titre:    'Nouvelle connexion',
          message:  `${result.user.prenom} ${result.user.nom} (${ROLE_LABELS[result.user.role] ?? result.user.role}) vient de se connecter`,
          type:     'info',
          priorite: 'basse',
          lien:     '/utilisateurs',
        }).catch(console.error);
      }

      res.status(HTTP_STATUS.OK).json(successResponse(result, 'Connexion réussie'));
    } catch (error) {
      // ✅ Log tentative échouée
      await logLoginFailed(email, ip, userAgent).catch(console.error);
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registerData = {
        ...req.body,
        password: req.body.password || req.body.mot_de_passe,
      };
      const result = await this.registerUser.execute(registerData);
      res.status(HTTP_STATUS.CREATED).json(successResponse(result, 'Utilisateur créé avec succès'));
    } catch (error) {
      next(error);
    }
  };

  // ✅ Logout — supprime la session active
  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Récupère le token depuis l'en-tête Authorization
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      if (token) {
        await deleteSession(token);
      }

      // Log déconnexion
      if (req.user?.id_user) {
        await pool.query(
          `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, statut)
           VALUES ($1, 'logout', 'auth', $2, 'success')`,
          [req.user.id_user, getIP(req)]
        ).catch(console.error);
      }

      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Déconnexion réussie'));
    } catch (error) {
      next(error);
    }
  };

  // Retourne l'utilisateur complet depuis la DB (pas juste le payload JWT)
  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT id_user, nom, prenom, email, role, specialite, telephone, statut, created_at
         FROM utilisateurs WHERE id_user = $1`,
        [req.user?.id_user]
      );

      if (result.rows.length === 0) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(result.rows[0], 'Utilisateur connecté'));
    } catch (error) {
      next(error);
    }
  };
}