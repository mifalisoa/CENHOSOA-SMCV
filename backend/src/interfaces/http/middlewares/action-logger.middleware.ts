// backend/src/interfaces/http/middlewares/action-logger.middleware.ts
//
// CHANGEMENTS :
// 1. getIP() est maintenant exportee (au lieu d'une copie privee dupliquee
//    dans AuthController.ts et ce fichier) -- reutilisee par le nouveau
//    ipBlock.middleware.ts sans tripler le code.
// 2. updateSessionActivity() prolonge desormais reellement expires_at
//    (timeout d'inactivite glissant), en plus de mettre a jour last_activity.
//    Avant ce correctif, la fonction existait mais n'etait appelee nulle
//    part -- maintenant appelee depuis auth.middleware.ts a chaque requete
//    authentifiee.

import { Request, Response, NextFunction } from 'express';
import { pool } from '../../../config/database';
import { AuthRequest } from './auth.middleware';

function parseUserAgent(ua: string): { device_type: string; browser: string; os: string } {
  const device_type = /mobile/i.test(ua) ? 'mobile'
    : /tablet|ipad/i.test(ua) ? 'tablet'
    : 'desktop';

  const browser = /firefox/i.test(ua) ? 'Firefox'
    : /edg/i.test(ua) ? 'Edge'
    : /chrome/i.test(ua) ? 'Chrome'
    : /safari/i.test(ua) ? 'Safari'
    : 'Autre';

  const os = /windows/i.test(ua) ? 'Windows'
    : /mac/i.test(ua) ? 'macOS'
    : /linux/i.test(ua) ? 'Linux'
    : /android/i.test(ua) ? 'Android'
    : /iphone|ipad/i.test(ua) ? 'iOS'
    : 'Autre';

  return { device_type, browser, os };
}

export function getIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

export function logAction(action: string, module: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    const originalJson = res.json.bind(res);
    let responseBody: Record<string, unknown> = {};

    res.json = (body: unknown) => {
      responseBody = body as Record<string, unknown>;
      return originalJson(body);
    };

    res.on('finish', async () => {
      try {
        const userId  = authReq.user?.id_user;
        const statut  = res.statusCode < 400 ? 'success' : 'error';
        const ip      = getIP(req);

        if (!userId) return;

        const settingRes = await pool.query(
          `SELECT valeur FROM parametres_securite WHERE cle = 'log_all_actions'`
        );
        const loggingEnabled = settingRes.rows[0]?.valeur !== 'false';
        if (!loggingEnabled) return;

        const details: Record<string, unknown> = {
          method:  req.method,
          path:    req.path,
          params:  req.params,
        };

        if (module !== 'auth') {
          details.body_keys = Object.keys(req.body || {});
        }

        await pool.query(
          `INSERT INTO logs_action
             (id_utilisateur, action, module, ip_address, user_agent, statut, details, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            action,
            module,
            ip,
            req.headers['user-agent']?.substring(0, 500) || null,
            statut,
            JSON.stringify(details),
            statut === 'error' ? (responseBody?.message as string || null) : null,
          ]
        );
      } catch (err) {
        console.error('[ActionLogger] Erreur log:', err);
      }
    });

    next();
  };
}

export async function createSession(
  userId: number,
  sessionId: string,
  req: Request
): Promise<void> {
  try {
    const ip     = getIP(req);
    const ua     = req.headers['user-agent'] || '';
    const parsed = parseUserAgent(ua);

    const settingRes = await pool.query(
      `SELECT valeur FROM parametres_securite WHERE cle = 'session_timeout_minutes'`
    );
    const timeoutMins = parseInt(settingRes.rows[0]?.valeur || '180');

   await pool.query(
  `INSERT INTO sessions_actives
     (session_id, id_user, ip_address, user_agent, device_type, browser, os, expires_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + ($8 || ' minutes')::INTERVAL)
   ON CONFLICT (session_id)
   DO UPDATE SET last_activity = NOW(), expires_at = NOW() + ($8 || ' minutes')::INTERVAL`,
  [sessionId, userId, ip, ua.substring(0, 500), parsed.device_type, parsed.browser, parsed.os, timeoutMins]
);
  } catch (err) {
    console.error('[ActionLogger] createSession erreur:', err);
  }
}

// CHANGEMENT : prolonge desormais expires_at en plus de last_activity --
// timeout d'inactivite glissant. Relit session_timeout_minutes a chaque
// appel (pas mis en cache) pour qu'un changement de parametre par l'admin
// prenne effet immediatement, sans attendre une reconnexion.
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    const settingRes = await pool.query(
      `SELECT valeur FROM parametres_securite WHERE cle = 'session_timeout_minutes'`
    );
    const timeoutMins = parseInt(settingRes.rows[0]?.valeur || '180');

    await pool.query(
      `UPDATE sessions_actives
       SET last_activity = NOW(), expires_at = NOW() + ($2 || ' minutes')::INTERVAL
       WHERE session_id = $1`,
      [sessionId, timeoutMins]
    );
  } catch (err) {
    // silencieux -- ne doit jamais faire echouer la requete en cours
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM sessions_actives WHERE session_id = $1`,
      [sessionId]
    );
  } catch (err) {
    console.error('[ActionLogger] deleteSession erreur:', err);
  }
}

export async function logLoginFailed(
  email: string,
  ip: string,
  userAgent: string
): Promise<void> {
  try {
    const userRes = await pool.query(
      `SELECT id_user FROM utilisateurs WHERE email = $1`,
      [email]
    );
    const userId = userRes.rows[0]?.id_user || null;

    await pool.query(
      `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, user_agent, statut, details)
       VALUES ($1, 'login', 'auth', $2, $3, 'error', $4)`,
      [userId, ip, userAgent.substring(0, 500), JSON.stringify({ email, reason: 'invalid_credentials' })]
    );

    const failsRes = await pool.query(
      `SELECT COUNT(*) FROM logs_action
       WHERE action = 'login' AND statut = 'error' AND ip_address = $1
         AND created_at > NOW() - INTERVAL '1 hour'`,
      [ip]
    );
    const failCount = parseInt(failsRes.rows[0].count);

    const thresholdRes = await pool.query(
      `SELECT valeur FROM parametres_securite WHERE cle = 'alert_threshold_fails'`
    );
    const threshold = parseInt(thresholdRes.rows[0]?.valeur || '3');

    if (failCount >= threshold) {
      await pool.query(
        `INSERT INTO alertes_securite (type_alerte, severite, titre, message, ip_address, id_utilisateur)
         VALUES ('brute_force', 'high', $1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [
          `Tentatives de connexion répétées (${failCount}x)`,
          `${failCount} tentatives échouées depuis ${ip} pour le compte ${email}`,
          ip,
          userId,
        ]
      );
    }
  } catch (err) {
    console.error('[ActionLogger] logLoginFailed erreur:', err);
  }
}

export async function logLoginSuccess(
  userId: number,
  ip: string,
  userAgent: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO logs_action (id_utilisateur, action, module, ip_address, user_agent, statut)
       VALUES ($1, 'login', 'auth', $2, $3, 'success')`,
      [userId, ip, userAgent.substring(0, 500)]
    );
  } catch (err) {
    console.error('[ActionLogger] logLoginSuccess erreur:', err);
  }
}