// backend/src/interfaces/http/controllers/SecuriteController.ts
//
// RECENTRAGE : ce module ne garde que ce qui sert reellement l'usage
// hospitalier -- tracabilite (logs), sessions actives + deconnexion forcee,
// alertes de securite. Retires : parametres de securite editables en live
// (risque si un compte admin est compromis, et les valeurs par defaut sont
// deja adaptees a un usage medical -- rester modifiables uniquement en base
// par un developpeur, pas via une UI web), blocage d'IP manuel (le rate
// limiting deja en place protege automatiquement, sans dependre qu'un admin
// remarque et reagisse a temps).
//
// CHANGEMENTS sur getSessions :
// - Alias utilisateur_nom/utilisateur_prenom/utilisateur_email ajoutes en
//   sortie (le frontend les attendait, la vue SQL ne les fournissait pas
//   sous ces noms -- corrige ici plutot que de renommer la vue).
// - activity_status et duration_seconds desormais calcules ici : ces champs
//   n'existent pas en base, le frontend les attendait sans qu'aucune requete
//   ne les fournisse jamais.
//
// CHANGEMENT sur getLogs : le filtre "periode" (today/week/month) etait
// envoye par le frontend mais jamais lu ici -- corrige.

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
      console.error('[Sécurité] getStats:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/sessions ────────────────────────────────────────────
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT * FROM v_sessions_actives ORDER BY last_activity DESC`
      );

      const now = Date.now();

      const sessions = result.rows.map(row => {
        const lastActivityMs = new Date(row.last_activity).getTime();
        const createdAtMs    = new Date(row.created_at).getTime();
        const diffMins       = Math.floor((now - lastActivityMs) / 60000);

        // Memes seuils que ceux deja utilises cote frontend (DashboardSecuritePage) :
        // < 5 min = en ligne, < 30 min = inactif, au-dela = absent.
        const activity_status = diffMins < 5 ? 'active' : diffMins < 30 ? 'idle' : 'away';
        const duration_seconds = Math.floor((now - createdAtMs) / 1000);

        return {
          ...row,
          utilisateur_nom:    row.nom,
          utilisateur_prenom: row.prenom,
          utilisateur_email:  row.email,
          activity_status,
          duration_seconds,
        };
      });

      res.json({ success: true, data: sessions });
    } catch (error) {
      console.error('[Sécurité] getSessions:', error);
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
      console.error('[Sécurité] disconnectSession:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  // ── GET /api/securite/logs ────────────────────────────────────────────────
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { module, action, statut, periode, limit = '50', offset = '0' } = req.query;

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
      // NOUVEAU : le frontend envoyait deja ce parametre, jamais lu ici.
      if (periode === 'today') {
        conditions.push(`l.created_at >= CURRENT_DATE`);
      } else if (periode === 'week') {
        conditions.push(`l.created_at >= NOW() - INTERVAL '7 days'`);
      } else if (periode === 'month') {
        conditions.push(`l.created_at >= NOW() - INTERVAL '30 days'`);
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
      console.error('[Sécurité] getLogs:', error);
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
      console.error('[Sécurité] getAlertes:', error);
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
      console.error('[Sécurité] updateAlerte:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}