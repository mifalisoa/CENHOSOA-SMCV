// backend/src/interfaces/http/controllers/UtilisateursController.ts

import { Response } from 'express';
import { pool }     from '../../../config/database';
import bcrypt       from 'bcrypt';
import { sendCompteCreé } from '../../../infrastructure/security/email.service';
import { AuthRequest }    from '../middlewares/auth.middleware';

const SELECT_COLS = `
  id_user, nom, prenom, email, role,
  telephone, specialite, statut, premier_connexion, created_at, updated_at
`;

function genererMotDePasseTemporaire(): string {
  const lettres  = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const chiffres = '23456789';
  const symboles = '!@#$%';
  let mdp = '';
  for (let i = 0; i < 4; i++) mdp += lettres[Math.floor(Math.random() * lettres.length)];
  for (let i = 0; i < 4; i++) mdp += chiffres[Math.floor(Math.random() * chiffres.length)];
  mdp += symboles[Math.floor(Math.random() * symboles.length)];
  mdp += chiffres[Math.floor(Math.random() * chiffres.length)];
  return mdp.split('').sort(() => Math.random() - 0.5).join('');
}

export class UtilisateursController {

  // GET /api/utilisateurs
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('📋 [UtilisateursController] getAll');
      const { role, statut } = req.query;
      const conditions: string[] = [];
      const params: unknown[]    = [];
      let i = 1;
      if (role)   { conditions.push(`role = $${i++}`);   params.push(role);   }
      if (statut) { conditions.push(`statut = $${i++}`); params.push(statut); }
      const where  = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      const result = await pool.query(
        `SELECT ${SELECT_COLS} FROM utilisateurs ${where} ORDER BY nom, prenom`, params
      );
      console.log(`✅ [UtilisateursController] ${result.rows.length} utilisateurs trouvés`);
      res.json({ success: true, data: result.rows });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur getAll:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la récupération' } });
    }
  }

  // GET /api/utilisateurs/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT ${SELECT_COLS} FROM utilisateurs WHERE id_user = $1`, [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur getById:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la récupération' } });
    }
  }

  // POST /api/utilisateurs
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, prenom, email, role, telephone, specialite, statut } = req.body;
      console.log('➕ [UtilisateursController] create:', { nom, prenom, email, role });

      if (!nom || !prenom || !email || !role) {
        res.status(400).json({ success: false, error: { message: 'Champs obligatoires manquants' } });
        return;
      }

      const checkEmail = await pool.query('SELECT id_user FROM utilisateurs WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        res.status(400).json({ success: false, error: { message: 'Cet email est déjà utilisé' } });
        return;
      }

      const motDePasseTemporaire = genererMotDePasseTemporaire();
      const hashedPassword       = await bcrypt.hash(motDePasseTemporaire, 10);

      const result = await pool.query(
        `INSERT INTO utilisateurs
           (nom, prenom, email, mot_de_passe, role, telephone, specialite, statut,
            premier_connexion, mot_de_passe_temporaire)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE)
         RETURNING ${SELECT_COLS}`,
        [nom, prenom, email, hashedPassword, role, telephone || null, specialite || null, statut || 'actif']
      );

      const nouvelUtilisateur = result.rows[0];
      console.log(`✅ [UtilisateursController] Utilisateur créé - ID: ${nouvelUtilisateur.id_user}`);

      try {
        await sendCompteCreé({ to: email, prenom, nom, role, motDePasseTemporaire });
        console.log(`📧 [UtilisateursController] Email envoyé à ${email}`);
      } catch (emailError) {
        console.error('⚠️ [UtilisateursController] Email non envoyé:', emailError);
      }

      res.status(201).json({
        success: true, data: nouvelUtilisateur,
        message: 'Utilisateur créé avec succès — email envoyé avec les identifiants',
      });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur create:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la création' } });
    }
  }

  // PUT /api/utilisateurs/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nom, prenom, email, mot_de_passe, role, telephone, specialite, statut } = req.body;

      const checkUser = await pool.query('SELECT id_user FROM utilisateurs WHERE id_user = $1', [id]);
      if (checkUser.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      if (email) {
        const checkEmail = await pool.query(
          'SELECT id_user FROM utilisateurs WHERE email = $1 AND id_user != $2', [email, id]
        );
        if (checkEmail.rows.length > 0) {
          res.status(400).json({ success: false, error: { message: 'Cet email est déjà utilisé' } });
          return;
        }
      }

      let updateQuery = `
        UPDATE utilisateurs
        SET nom = $1, prenom = $2, email = $3, role = $4,
            telephone = $5, specialite = $6, statut = $7, updated_at = CURRENT_TIMESTAMP
      `;
      const params: unknown[] = [nom, prenom, email, role, telephone || null, specialite || null, statut];

      if (mot_de_passe) {
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        updateQuery += `, mot_de_passe = $8 WHERE id_user = $9`;
        params.push(hashedPassword, id);
      } else {
        updateQuery += ` WHERE id_user = $8`;
        params.push(id);
      }

      updateQuery += ` RETURNING ${SELECT_COLS}`;
      const result  = await pool.query(updateQuery, params);
      res.json({ success: true, data: result.rows[0], message: 'Utilisateur modifié avec succès' });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur update:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la modification' } });
    }
  }

  // PATCH /api/utilisateurs/:id/statut
  async changeStatut(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id }      = req.params;
      const { statut }  = req.body;
      const currentUser = req.user;

      // ✅ Protection : l'admin ne peut pas modifier son propre statut
      if (currentUser && String(currentUser.id_user) === String(id)) {
        res.status(400).json({
          success: false,
          error: { message: 'Vous ne pouvez pas modifier votre propre statut' },
        });
        return;
      }

      if (!['actif', 'inactif', 'suspendu'].includes(statut)) {
        res.status(400).json({ success: false, error: { message: 'Statut invalide' } });
        return;
      }

      const result = await pool.query(
        `UPDATE utilisateurs SET statut = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id_user = $2 RETURNING ${SELECT_COLS}`,
        [statut, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      res.json({ success: true, data: result.rows[0], message: 'Statut modifié avec succès' });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur changeStatut:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors du changement de statut' } });
    }
  }

  // DELETE /api/utilisateurs/:id
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id }      = req.params;
      const currentUser = req.user;

      // ✅ Protection : l'admin ne peut pas supprimer son propre compte
      if (currentUser && String(currentUser.id_user) === String(id)) {
        res.status(400).json({
          success: false,
          error: { message: 'Vous ne pouvez pas supprimer votre propre compte' },
        });
        return;
      }

      const result = await pool.query(
        'DELETE FROM utilisateurs WHERE id_user = $1 RETURNING id_user', [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur delete:', error);
      const pgError = error as { code?: string };
      if (pgError.code === '23503') {
        res.status(400).json({
          success: false,
          error: { message: 'Impossible de supprimer — cet utilisateur est lié à des données existantes' },
        });
        return;
      }
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la suppression' } });
    }
  }

  // POST /api/utilisateurs/:id/reinitialiser-mot-de-passe
  async reinitialiserMotDePasse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const userResult = await pool.query(
        'SELECT id_user, nom, prenom, email, role FROM utilisateurs WHERE id_user = $1', [id]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      const user                 = userResult.rows[0];
      const motDePasseTemporaire = genererMotDePasseTemporaire();
      const hashedPassword       = await bcrypt.hash(motDePasseTemporaire, 10);

      await pool.query(
        `UPDATE utilisateurs
         SET mot_de_passe = $1, premier_connexion = TRUE,
             mot_de_passe_temporaire = TRUE, updated_at = NOW()
         WHERE id_user = $2`,
        [hashedPassword, id]
      );

      try {
        await sendCompteCreé({
          to: user.email, prenom: user.prenom, nom: user.nom,
          role: user.role, motDePasseTemporaire,
        });
        console.log(`📧 [UtilisateursController] Email réinitialisation envoyé à ${user.email}`);
      } catch (emailError) {
        console.error('⚠️ [UtilisateursController] Email non envoyé:', emailError);
      }

      res.json({ success: true, message: 'Mot de passe réinitialisé — email envoyé' });
    } catch (error: unknown) {
      console.error('❌ [UtilisateursController] Erreur reinitialiserMotDePasse:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la réinitialisation' } });
    }
  }
}