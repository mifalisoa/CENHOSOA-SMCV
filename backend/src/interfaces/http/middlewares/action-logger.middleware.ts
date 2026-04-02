// backend/src/interfaces/http/middlewares/action-logger.middleware.ts
//
// Middleware qui enregistre automatiquement les actions dans logs_action
// et gère les sessions actives (création à la connexion, MAJ last_activity)
//
// Usage dans les routes :
//   router.post('/patients', authMiddleware, logAction('create', 'patients'), controller.create)

import { Request, Response, NextFunction } from 'express';
import { pool } from '../../../config/database';
import { AuthRequest } from './auth.middleware';

// ── Détection device/browser simplifiée ──────────────────────────────────────
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

function getIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// ── Middleware principal de log ───────────────────────────────────────────────
export function logAction(action: string, module: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    // Intercepte la fin de la réponse pour connaître le statut
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

        // Ne log pas si pas d'utilisateur (accès non authentifié)
        if (!userId) return;

        // Vérifie si le logging est activé
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

        // N'inclut pas le body pour éviter de logguer des données sensibles (mots de passe)
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
        // Le logging ne doit jamais faire planter l'app
        console.error('⚠️ [ActionLogger] Erreur log:', err);
      }
    });

    next();
  };
}

// ── Gestion session — à appeler après login réussi ────────────────────────────
export async function createSession(
  userId: number,
  sessionId: string,
  req: Request
): Promise<void> {
  try {
    const ip     = getIP(req);
    const ua     = req.headers['user-agent'] || '';
    const parsed = parseUserAgent(ua);

    // Durée de session depuis les paramètres (défaut 180 min)
    const settingRes = await pool.query(
      `SELECT valeur FROM parametres_securite WHERE cle = 'session_timeout_minutes'`
    );
    const timeoutMins = parseInt(settingRes.rows[0]?.valeur || '180');

    await pool.query(
      `INSERT INTO sessions_actives
         (session_id, id_utilisateur, ip_address, user_agent, device_type, browser, os, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + ($8 || ' minutes')::INTERVAL)
       ON CONFLICT (session_id)
       DO UPDATE SET last_activity = NOW(), expires_at = NOW() + ($8 || ' minutes')::INTERVAL`,
      [sessionId, userId, ip, ua.substring(0, 500), parsed.device_type, parsed.browser, parsed.os, timeoutMins]
    );
  } catch (err) {
    console.error('⚠️ [ActionLogger] createSession erreur:', err);
  }
}

// ── Mise à jour last_activity à chaque requête authentifiée ──────────────────
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE sessions_actives SET last_activity = NOW() WHERE session_id = $1`,
      [sessionId]
    );
  } catch (err) {
    // silencieux
  }
}

// ── Supprime une session (logout) ─────────────────────────────────────────────
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM sessions_actives WHERE session_id = $1`,
      [sessionId]
    );
  } catch (err) {
    console.error('⚠️ [ActionLogger] deleteSession erreur:', err);
  }
}

// ── Log tentative de connexion échouée + alerte si seuil atteint ─────────────
export async function logLoginFailed(
  email: string,
  ip: string,
  userAgent: string
): Promise<void> {
  try {
    // Trouve l'utilisateur si il existe
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

    // Compte les échecs récents depuis cette IP
    const failsRes = await pool.query(
      `SELECT COUNT(*) FROM logs_action
       WHERE action = 'login' AND statut = 'error' AND ip_address = $1
         AND created_at > NOW() - INTERVAL '1 hour'`,
      [ip]
    );
    const failCount = parseInt(failsRes.rows[0].count);

    // Récupère le seuil d'alerte
    const thresholdRes = await pool.query(
      `SELECT valeur FROM parametres_securite WHERE cle = 'alert_threshold_fails'`
    );
    const threshold = parseInt(thresholdRes.rows[0]?.valeur || '3');

    if (failCount >= threshold) {
      // Crée une alerte sécurité
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
    console.error('⚠️ [ActionLogger] logLoginFailed erreur:', err);
  }
}

// ── Log connexion réussie ─────────────────────────────────────────────────────
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
    console.error('⚠️ [ActionLogger] logLoginSuccess erreur:', err);
  }
}