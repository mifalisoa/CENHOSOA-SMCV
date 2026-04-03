// backend/src/interfaces/http/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { LoginUser }           from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser }        from '../../../application/use-cases/auth/RegisterUser';
import { successResponse }     from '../../../shared/utils/response.utils';
import { HTTP_STATUS }         from '../../../config/constants';
import { AuthRequest }         from '../middlewares/auth.middleware';
import { pool }                from '../../../config/database';
import { notificationService } from '../../../application/services/NotificationService';
import bcrypt                  from 'bcrypt';
import {
  logLoginSuccess,
  logLoginFailed,
  createSession,
  deleteSession,
} from '../middlewares/action-logger.middleware';
import { sendMotDePasseChangé } from '../../../infrastructure/security/email.service';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur', medecin: 'Médecin', interne: 'Interne',
  stagiaire: 'Stagiaire', infirmier: 'Infirmier', secretaire: 'Secrétaire',
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
      const result = await this.loginUser.execute({
        email,
        password: req.body.password || req.body.mot_de_passe,
      });

      await logLoginSuccess(result.user.id_user, ip, userAgent);
      await createSession(result.user.id_user, result.token, req);

      if (result.user.role !== 'admin') {
        notificationService.notifyAdmins({
          titre:    'Nouvelle connexion',
          message:  `${result.user.prenom} ${result.user.nom} (${ROLE_LABELS[result.user.role] ?? result.user.role}) vient de se connecter`,
          type:     'info',
          priorite: 'basse',
          lien:     '/utilisateurs',
        }).catch(console.error);
      }

      // ✅ Inclut premier_connexion pour que le frontend redirige
      res.status(HTTP_STATUS.OK).json(successResponse({
        ...result,
        premier_connexion: result.user.premier_connexion ?? false,
      }, 'Connexion réussie'));
    } catch (error) {
      await logLoginFailed(email, ip, userAgent).catch(console.error);
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUser.execute({
        ...req.body,
        password: req.body.password || req.body.mot_de_passe,
      });
      res.status(HTTP_STATUS.CREATED).json(successResponse(result, 'Utilisateur créé avec succès'));
    } catch (error) {
      next(error);
    }
  };

  // ✅ POST /auth/changer-mot-de-passe
  changerMotDePasse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
      const userId = req.user?.id_user;

      if (!nouveau_mot_de_passe || nouveau_mot_de_passe.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        });
        return;
      }

      const userResult = await pool.query(
        `SELECT id_user, nom, prenom, email, mot_de_passe, premier_connexion
         FROM utilisateurs WHERE id_user = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      const user = userResult.rows[0];

      // Si pas première connexion → vérifie l'ancien mot de passe
      if (!user.premier_connexion) {
        if (!ancien_mot_de_passe) {
          res.status(400).json({ success: false, message: "L'ancien mot de passe est requis" });
          return;
        }
        const valid = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
        if (!valid) {
          res.status(400).json({ success: false, message: 'Ancien mot de passe incorrect' });
          return;
        }
      }

      const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, 10);
      await pool.query(
        `UPDATE utilisateurs
         SET mot_de_passe = $1, premier_connexion = FALSE,
             mot_de_passe_temporaire = FALSE, updated_at = NOW()
         WHERE id_user = $2`,
        [hashedPassword, userId]
      );

      // Email de confirmation
      try {
        await sendMotDePasseChangé({ to: user.email, prenom: user.prenom, nom: user.nom });
      } catch (emailError) {
        console.error('⚠️ [Auth] Email confirmation non envoyé:', emailError);
      }

      // Log
      await pool.query(
        `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, statut)
         VALUES ($1, 'update', 'auth', $2, 'success')`,
        [userId, getIP(req)]
      ).catch(console.error);

      res.status(HTTP_STATUS.OK).json(successResponse(null, 'Mot de passe modifié avec succès'));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      if (token) await deleteSession(token);

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

  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT id_user, nom, prenom, email, role, specialite, telephone,
                statut, premier_connexion, created_at
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