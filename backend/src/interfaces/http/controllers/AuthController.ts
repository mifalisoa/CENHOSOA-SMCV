// backend/src/interfaces/http/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { LoginUser }          from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser }       from '../../../application/use-cases/auth/RegisterUser';
import { successResponse }    from '../../../shared/utils/response.utils';
import { HTTP_STATUS }        from '../../../config/constants';
import { AuthRequest }        from '../middlewares/auth.middleware';
import { pool }               from '../../../config/database';
import { notificationService } from '../../../application/services/NotificationService';

const ROLE_LABELS: Record<string, string> = {
  admin:      'Administrateur',
  medecin:    'Médecin',
  interne:    'Interne',
  stagiaire:  'Stagiaire',
  infirmier:  'Infirmier',
  secretaire: 'Secrétaire',
};

export class AuthController {
  constructor(
    private loginUser:    LoginUser,
    private registerUser: RegisterUser
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = {
        email:    req.body.email    || req.body.email_user,
        password: req.body.password || req.body.mot_de_passe,
      };

      const result = await this.loginUser.execute(loginData);

      // Ne pas notifier si c'est un admin qui se connecte (éviter les boucles)
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