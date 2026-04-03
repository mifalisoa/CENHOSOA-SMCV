// backend/src/interfaces/http/controllers/SetupController.ts

import { Request, Response } from 'express';
import { pool }   from '../../../config/database';
import bcrypt     from 'bcrypt';
import crypto     from 'crypto';
import { sendCompteCreé, sendResetPassword } from '../../../infrastructure/security/email.service';

export class SetupController {

  // GET /api/setup/status — vérifie si le setup est fait
  status = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query('SELECT setup_done FROM app_setup LIMIT 1');
      const setupDone = result.rows[0]?.setup_done ?? false;
      res.json({ success: true, data: { setup_done: setupDone } });
    } catch (error) {
      console.error('❌ [SetupController] Erreur status:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
    }
  };

  // POST /api/setup — crée le premier admin (uniquement si setup pas encore fait)
  setup = async (req: Request, res: Response): Promise<void> => {
    try {
      // Vérifie que le setup n'est pas déjà fait
      const checkSetup = await pool.query('SELECT setup_done FROM app_setup LIMIT 1');
      if (checkSetup.rows[0]?.setup_done) {
        res.status(403).json({
          success: false,
          error: { message: 'Configuration déjà effectuée' },
        });
        return;
      }

      const { nom, prenom, email, mot_de_passe } = req.body;

      if (!nom || !prenom || !email || !mot_de_passe) {
        res.status(400).json({ success: false, error: { message: 'Tous les champs sont obligatoires' } });
        return;
      }

      if (mot_de_passe.length < 8) {
        res.status(400).json({ success: false, error: { message: 'Le mot de passe doit contenir au moins 8 caractères' } });
        return;
      }

      // Vérifie qu'aucun admin n'existe déjà
      const checkAdmin = await pool.query(
        "SELECT id_user FROM utilisateurs WHERE role = 'admin' LIMIT 1"
      );
      if (checkAdmin.rows.length > 0) {
        // Met à jour le setup_done si admin existe mais setup_done = false
        await pool.query(
          "UPDATE app_setup SET setup_done = TRUE, done_at = NOW(), admin_email = $1",
          [email]
        );
        res.status(403).json({
          success: false,
          error: { message: 'Un administrateur existe déjà' },
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // Crée le compte admin
      await pool.query(
        `INSERT INTO utilisateurs
           (nom, prenom, email, mot_de_passe, role, statut, premier_connexion, mot_de_passe_temporaire)
         VALUES ($1, $2, $3, $4, 'admin', 'actif', FALSE, FALSE)`,
        [nom, prenom, email, hashedPassword]
      );

      // Marque le setup comme fait
      await pool.query(
        "UPDATE app_setup SET setup_done = TRUE, done_at = NOW(), admin_email = $1",
        [email]
      );

      console.log(`✅ [SetupController] Admin créé : ${email}`);

      res.status(201).json({
        success: true,
        message: 'Configuration initiale terminée — vous pouvez vous connecter',
      });
    } catch (error) {
      console.error('❌ [SetupController] Erreur setup:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la configuration' } });
    }
  };

  // POST /api/auth/mot-de-passe-oublie — envoie un email avec token de reset
  motDePasseOublie = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, error: { message: 'Email requis' } });
        return;
      }

      const userResult = await pool.query(
        "SELECT id_user, nom, prenom, email FROM utilisateurs WHERE email = $1 AND statut = 'actif'",
        [email]
      );

      // Toujours répondre OK même si l'email n'existe pas (sécurité)
      if (userResult.rows.length === 0) {
        res.json({ success: true, message: 'Si cet email existe, un lien vous a été envoyé' });
        return;
      }

      const user = userResult.rows[0];

      // Invalide les anciens tokens
      await pool.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE id_user = $1 AND used = FALSE',
        [user.id_user]
      );

      // Génère un token sécurisé
      const token     = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

      await pool.query(
        'INSERT INTO password_reset_tokens (id_user, token, expires_at) VALUES ($1, $2, $3)',
        [user.id_user, token, expiresAt]
      );

      // Envoie l'email
      try {
        await sendResetPassword({
          to:     user.email,
          prenom: user.prenom,
          nom:    user.nom,
          token,
        });
        console.log(`📧 [SetupController] Email reset envoyé à ${email}`);
      } catch (emailError) {
        console.error('⚠️ [SetupController] Email reset non envoyé:', emailError);
      }

      res.json({ success: true, message: 'Si cet email existe, un lien vous a été envoyé' });
    } catch (error) {
      console.error('❌ [SetupController] Erreur motDePasseOublie:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
    }
  };

  // POST /api/auth/reset-password — réinitialise le mot de passe via token
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, nouveau_mot_de_passe } = req.body;

      if (!token || !nouveau_mot_de_passe) {
        res.status(400).json({ success: false, error: { message: 'Token et nouveau mot de passe requis' } });
        return;
      }

      if (nouveau_mot_de_passe.length < 8) {
        res.status(400).json({ success: false, error: { message: 'Le mot de passe doit contenir au moins 8 caractères' } });
        return;
      }

      // Vérifie le token
      const tokenResult = await pool.query(
        `SELECT prt.id, prt.id_user, prt.expires_at, prt.used,
                u.nom, u.prenom, u.email
         FROM password_reset_tokens prt
         JOIN utilisateurs u ON u.id_user = prt.id_user
         WHERE prt.token = $1`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        res.status(400).json({ success: false, error: { message: 'Lien invalide ou expiré' } });
        return;
      }

      const tokenData = tokenResult.rows[0];

      if (tokenData.used) {
        res.status(400).json({ success: false, error: { message: 'Ce lien a déjà été utilisé' } });
        return;
      }

      if (new Date() > new Date(tokenData.expires_at)) {
        res.status(400).json({ success: false, error: { message: 'Ce lien a expiré — demandez-en un nouveau' } });
        return;
      }

      // Met à jour le mot de passe
      const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, 10);
      await pool.query(
        `UPDATE utilisateurs
         SET mot_de_passe = $1, premier_connexion = FALSE,
             mot_de_passe_temporaire = FALSE, updated_at = NOW()
         WHERE id_user = $2`,
        [hashedPassword, tokenData.id_user]
      );

      // Invalide le token
      await pool.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
        [tokenData.id]
      );

      console.log(`✅ [SetupController] Mot de passe réinitialisé pour ${tokenData.email}`);

      res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error('❌ [SetupController] Erreur resetPassword:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
    }
  };

  // GET /api/auth/reset-password/:token/verify — vérifie si le token est valide
  verifyResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `SELECT prt.used, prt.expires_at, u.prenom, u.nom
         FROM password_reset_tokens prt
         JOIN utilisateurs u ON u.id_user = prt.id_user
         WHERE prt.token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        res.status(400).json({ success: false, error: { message: 'Lien invalide' } });
        return;
      }

      const tokenData = result.rows[0];

      if (tokenData.used || new Date() > new Date(tokenData.expires_at)) {
        res.status(400).json({ success: false, error: { message: 'Lien expiré ou déjà utilisé' } });
        return;
      }

      res.json({
        success: true,
        data: { prenom: tokenData.prenom, nom: tokenData.nom },
      });
    } catch (error) {
      console.error('❌ [SetupController] Erreur verifyResetToken:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
    }
  };
}