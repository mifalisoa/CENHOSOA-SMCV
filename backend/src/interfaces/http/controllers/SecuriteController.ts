// backend/src/interfaces/http/controllers/SecuriteController.ts

import { Request, Response } from 'express';
import { pool } from '../../../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SecuriteController {

  // ── GET /api/securite/stats ───────────────────────────────────────────────
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [sessionsRes, failsRes, actionsRes, alertesRes] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM v_sessions_actives`),
        pool.query(`
          SELECT COUNT(*) FROM logs_action
          WHERE statut IN ('error', 'blocked')
            AND action = 'login'
            AND created_at > NOW() - INTERVAL '24 hours'
        `),
        pool.query(`
          SELECT COUNT(*) FROM logs_action
          WHERE created_at > NOW() - INTERVAL '24 hours'
            AND statut = 'success'
        `),
        pool.query(`SELECT COUNT(*) FROM alertes_securite WHERE lue = FALSE`),
      ]);

      res.json({
        success: true,
        data: {
          sessions_actives:        parseInt(sessionsRes.rows[0].count),
          tentatives_echouees_24h: parseInt(failsRes.rows[0].count),
          actions_aujourdhui:      parseInt(actionsRes.rows[0].count),
          alertes_non_lues:        parseInt(alertesRes.rows[0].count),
        },
      });
    } catch (error) {
      console.error('❌ [Sécurité] getStats:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/sessions ────────────────────────────────────────────
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(`SELECT * FROM v_sessions_actives`);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('❌ [Sécurité] getSessions:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── DELETE /api/securite/sessions/:sessionId ──────────────────────────────
  async disconnectSession(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const { sessionId } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM sessions_actives WHERE session_id = $1 RETURNING session_id`,
        [sessionId]
      );
      if (result.rowCount === 0) {
        res.status(404).json({ success: false, message: 'Session introuvable' });
        return;
      }
      // Log l'action
      await pool.query(
        `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, statut, details)
         VALUES ($1, 'delete', 'security', $2, 'success', $3)`,
        [
          authReq.user?.id_user,
          req.ip,
          JSON.stringify({ action: 'disconnect_session', session_id: sessionId }),
        ]
      );
      res.json({ success: true, message: 'Session déconnectée avec succès' });
    } catch (error) {
      console.error('❌ [Sécurité] disconnectSession:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/logs ────────────────────────────────────────────────
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { module, action, statut, limit = '50', offset = '0' } = req.query;

      const conditions: string[] = [];
      const params: unknown[]    = [];
      let idx = 1;

      if (module && module !== 'all') {
        conditions.push(`l.module = $${idx++}`);
        params.push(module);
      }
      if (action && action !== 'all') {
        conditions.push(`l.action = $${idx++}`);
        params.push(action);
      }
      if (statut && statut !== 'all') {
        conditions.push(`l.statut = $${idx++}`);
        params.push(statut);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const [dataRes, countRes] = await Promise.all([
        pool.query(
          `SELECT
             l.id_log,
             u.nom       AS utilisateur_nom,
             u.prenom    AS utilisateur_prenom,
             u.email     AS utilisateur_email,
             u.role,
             l.action,
             l.module,
             l.ip_address,
             l.statut,
             l.details,
             l.error_message,
             l.created_at
           FROM logs_action l
           LEFT JOIN utilisateurs u ON u.id_user = l.id_utilisateur
           ${where}
           ORDER BY l.created_at DESC
           LIMIT $${idx} OFFSET $${idx + 1}`,
          [...params, parseInt(limit as string), parseInt(offset as string)]
        ),
        pool.query(
          `SELECT COUNT(*) FROM logs_action l ${where}`,
          params
        ),
      ]);

      res.json({
        success: true,
        data:   dataRes.rows,
        pagination: {
          total:      parseInt(countRes.rows[0].count),
          limit:      parseInt(limit as string),
          offset:     parseInt(offset as string),
          totalPages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('❌ [Sécurité] getLogs:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/alertes ─────────────────────────────────────────────
  async getAlertes(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT
          a.*,
          u.nom    AS utilisateur_nom,
          u.prenom AS utilisateur_prenom
        FROM alertes_securite a
        LEFT JOIN utilisateurs u ON u.id_user = a.id_utilisateur
        ORDER BY a.created_at DESC
        LIMIT 100
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('❌ [Sécurité] getAlertes:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── PATCH /api/securite/alertes/:id ──────────────────────────────────────
  async updateAlerte(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    try {
      await pool.query(
        `UPDATE alertes_securite SET lue = TRUE, lue_par = $1, lue_at = NOW() WHERE id_alerte = $2`,
        [authReq.user?.id_user, id]
      );
      res.json({ success: true, message: 'Alerte marquée comme lue' });
    } catch (error) {
      console.error('❌ [Sécurité] updateAlerte:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/parametres ─────────────────────────────────────────
  async getParametres(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT cle, valeur, type, categorie, description FROM parametres_securite ORDER BY categorie, cle`
      );
      // Groupe par catégorie
      const grouped: Record<string, typeof result.rows> = {};
      for (const row of result.rows) {
        if (!grouped[row.categorie]) grouped[row.categorie] = [];
        grouped[row.categorie].push(row);
      }
      res.json({ success: true, data: grouped });
    } catch (error) {
      console.error('❌ [Sécurité] getParametres:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── PUT /api/securite/parametres/:cle ────────────────────────────────────
  async updateParametre(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const { cle } = req.params;
    const { valeur } = req.body;

    if (valeur === undefined || valeur === null) {
      res.status(400).json({ success: false, message: 'Valeur manquante' });
      return;
    }
    try {
      const result = await pool.query(
        `UPDATE parametres_securite SET valeur = $1, updated_at = NOW() WHERE cle = $2 RETURNING *`,
        [String(valeur), cle]
      );
      if (result.rowCount === 0) {
        res.status(404).json({ success: false, message: 'Paramètre introuvable' });
        return;
      }
      // Log
      await pool.query(
        `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, statut, details)
         VALUES ($1, 'update', 'security', $2, 'success', $3)`,
        [authReq.user?.id_user, req.ip, JSON.stringify({ parametre: cle, nouvelle_valeur: valeur })]
      );
      res.json({ success: true, data: result.rows[0], message: 'Paramètre mis à jour' });
    } catch (error) {
      console.error('❌ [Sécurité] updateParametre:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/ips ─────────────────────────────────────────────────
  async getIPsBloquees(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT i.*, u.nom AS bloquee_par_nom, u.prenom AS bloquee_par_prenom
        FROM ips_bloquees i
        LEFT JOIN utilisateurs u ON u.id_user = i.bloquee_par
        WHERE i.active = TRUE
        ORDER BY i.bloquee_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('❌ [Sécurité] getIPsBloquees:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── POST /api/securite/ips/bloquer ────────────────────────────────────────
  async bloquerIP(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const { ip_address, raison, duree_heures } = req.body;

    if (!ip_address) {
      res.status(400).json({ success: false, message: 'Adresse IP manquante' });
      return;
    }
    try {
      const expire_at = duree_heures
        ? new Date(Date.now() + duree_heures * 3600000).toISOString()
        : null;

      await pool.query(
        `INSERT INTO ips_bloquees (ip_address, raison, bloquee_par, expire_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (ip_address)
         DO UPDATE SET active = TRUE, raison = $2, bloquee_par = $3, expire_at = $4, bloquee_at = NOW()`,
        [ip_address, raison || null, authReq.user?.id_user, expire_at]
      );
      res.json({ success: true, message: `IP ${ip_address} bloquée` });
    } catch (error) {
      console.error('❌ [Sécurité] bloquerIP:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── DELETE /api/securite/ips/:id ─────────────────────────────────────────
  async debloquerIP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await pool.query(
        `UPDATE ips_bloquees SET active = FALSE WHERE id_ip = $1`,
        [id]
      );
      res.json({ success: true, message: 'IP débloquée' });
    } catch (error) {
      console.error('❌ [Sécurité] debloquerIP:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}