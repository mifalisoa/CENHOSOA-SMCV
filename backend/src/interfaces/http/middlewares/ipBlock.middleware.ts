// backend/src/interfaces/http/middlewares/ipBlock.middleware.ts
//
// NOUVEAU. Jusqu'ici, ips_bloquees etait alimentee par SecuriteController
// (bloquerIP/debloquerIP) mais rien ne la consultait jamais -- un admin qui
// bloquait une IP obtenait un message de succes sans aucun effet reel.
//
// Ce middleware verifie l'IP de CHAQUE requete entrante, avant meme
// l'authentification (une IP bloquee doit etre rejetee y compris sur
// /auth/login, pas seulement sur les routes protegees).
//
// Choix : fail-open en cas d'erreur de requete DB (ne bloque jamais toute
// l'application si cette verification echoue) -- coherent avec le reste du
// projet (logAction, par exemple, echoue silencieusement plutot que de
// faire planter la requete).

import { Request, Response, NextFunction } from 'express';
import { pool } from '../../../config/database';
import { getIP } from './action-logger.middleware';

export const ipBlockMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = getIP(req);

    const result = await pool.query(
      `SELECT id_ip, expire_at FROM ips_bloquees WHERE ip_address = $1 AND active = TRUE`,
      [ip]
    );

    if (result.rows.length === 0) {
      next();
      return;
    }

    const blocked = result.rows[0];

    // Blocage temporaire expire : on le desactive et on laisse passer,
    // au lieu de rejeter une IP qui ne devrait plus l'etre.
    if (blocked.expire_at && new Date(blocked.expire_at) < new Date()) {
      await pool.query(`UPDATE ips_bloquees SET active = FALSE WHERE id_ip = $1`, [blocked.id_ip]);
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Accès refusé depuis cette adresse IP',
    });
  } catch (error) {
    console.error('[IPBlock] Erreur vérification IP:', error);
    // Fail-open : une erreur de verification ne doit jamais bloquer
    // l'ensemble de l'application.
    next();
  }
};