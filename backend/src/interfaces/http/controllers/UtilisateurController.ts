// backend/src/interfaces/http/controllers/UtilisateursController.ts

import { Request, Response } from 'express';
import { pool } from '../../../config/database';
import bcrypt from 'bcrypt';

// Colonnes retournées — id_user (PK), pas id_utilisateur
const SELECT_COLS = `
  id_user, nom, prenom, email, role,
  telephone, specialite, statut, created_at, updated_at
`;

export class UtilisateursController {

  // GET /api/utilisateurs?role=medecin&statut=actif
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 [UtilisateursController] getAll - Récupération de tous les utilisateurs');

      const { role, statut } = req.query;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let i = 1;

      if (role)   { conditions.push(`role = $${i++}`);   params.push(role);   }
      if (statut) { conditions.push(`statut = $${i++}`); params.push(statut); }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      const result = await pool.query(
        `SELECT ${SELECT_COLS} FROM utilisateurs ${where} ORDER BY nom, prenom`,
        params
      );

      console.log(`✅ [UtilisateursController] ${result.rows.length} utilisateurs trouvés`);

      res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur getAll:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la récupération des utilisateurs', details: error.message } });
    }
  }

  // GET /api/utilisateurs/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🔍 [UtilisateursController] getById - ID: ${id}`);

      const result = await pool.query(
        `SELECT ${SELECT_COLS} FROM utilisateurs WHERE id_user = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur getById:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la récupération de l\'utilisateur', details: error.message } });
    }
  }

  // POST /api/utilisateurs
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nom, prenom, email, mot_de_passe, role, telephone, specialite, statut } = req.body;
      console.log('➕ [UtilisateursController] create:', { nom, prenom, email, role });

      if (!nom || !prenom || !email || !mot_de_passe || !role) {
        res.status(400).json({ success: false, error: { message: 'Champs obligatoires manquants' } });
        return;
      }

      const checkEmail = await pool.query(
        'SELECT id_user FROM utilisateurs WHERE email = $1',
        [email]
      );
      if (checkEmail.rows.length > 0) {
        res.status(400).json({ success: false, error: { message: 'Cet email est déjà utilisé' } });
        return;
      }

      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      const result = await pool.query(
        `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, telephone, specialite, statut)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${SELECT_COLS}`,
        [nom, prenom, email, hashedPassword, role, telephone || null, specialite || null, statut || 'actif']
      );

      console.log(`✅ [UtilisateursController] Utilisateur créé - ID: ${result.rows[0].id_user}`);
      res.status(201).json({ success: true, data: result.rows[0], message: 'Utilisateur créé avec succès' });
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur create:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la création de l\'utilisateur', details: error.message } });
    }
  }

  // PUT /api/utilisateurs/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nom, prenom, email, mot_de_passe, role, telephone, specialite, statut } = req.body;
      console.log(`✏️ [UtilisateursController] update - ID: ${id}`);

      const checkUser = await pool.query(
        'SELECT id_user FROM utilisateurs WHERE id_user = $1',
        [id]
      );
      if (checkUser.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      if (email) {
        const checkEmail = await pool.query(
          'SELECT id_user FROM utilisateurs WHERE email = $1 AND id_user != $2',
          [email, id]
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

      const result = await pool.query(updateQuery, params);
      console.log(`✅ [UtilisateursController] Utilisateur mis à jour - ID: ${id}`);
      res.json({ success: true, data: result.rows[0], message: 'Utilisateur modifié avec succès' });
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur update:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la modification de l\'utilisateur', details: error.message } });
    }
  }

  // PATCH /api/utilisateurs/:id/statut
  async changeStatut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      console.log(`🔄 [UtilisateursController] changeStatut - ID: ${id}, Statut: ${statut}`);

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
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur changeStatut:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur lors du changement de statut', details: error.message } });
    }
  }

  // DELETE /api/utilisateurs/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🗑️ [UtilisateursController] delete - ID: ${id}`);

      const result = await pool.query(
        'DELETE FROM utilisateurs WHERE id_user = $1 RETURNING id_user',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: { message: 'Utilisateur non trouvé' } });
        return;
      }

      res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      console.error('❌ [UtilisateursController] Erreur delete:', error);
      if (error.code === '23503') {
        res.status(400).json({ success: false, error: { message: 'Impossible de supprimer cet utilisateur car il est lié à d\'autres données', details: error.message } });
        return;
      }
      res.status(500).json({ success: false, error: { message: 'Erreur lors de la suppression de l\'utilisateur', details: error.message } });
    }
  }
}