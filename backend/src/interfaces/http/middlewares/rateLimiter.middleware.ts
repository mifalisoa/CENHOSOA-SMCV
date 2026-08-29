// backend/src/interfaces/http/middlewares/rateLimiter.middleware.ts
//
// LEÇON : Le rate limiting est la première ligne de défense contre
// les attaques par force brute. Sans ça, un attaquant peut tester
// des milliers de mots de passe en quelques secondes.
//
// Installation : npm install express-rate-limit

import rateLimit from 'express-rate-limit';

// ── Login : 5 tentatives par IP sur 15 minutes ──────────────────────────────
export const loginRateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    retryAfter: 15,
  },
});

// ── API générale : 100 req/min par IP ───────────────────────────────────────
export const apiRateLimiter = rateLimit({
  windowMs:        60 * 1000, // 1 minute
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Trop de requêtes. Ralentissez.',
  },
});

// ── Lecture des fichiers uploades : 60 req/min par IP ───────────────────────
// NOUVEAU. Mitigation partielle en attendant une vraie authentification sur
// la lecture (voir main.ts). Un utilisateur normal qui consulte un dossier
// patient avec plusieurs pieces jointes reste largement sous ce seuil ;
// un script qui essaie d'enumerer des URLs en masse le depasse vite.
export const uploadsReadRateLimiter = rateLimit({
  windowMs:        60 * 1000, // 1 minute
  max:             60,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Trop de requêtes sur les fichiers. Ralentissez.',
  },
});