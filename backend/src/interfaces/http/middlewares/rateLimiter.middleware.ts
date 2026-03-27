// backend/src/interfaces/http/middlewares/rateLimiter.middleware.ts
//
// LEÇON : Le rate limiting est la première ligne de défense contre
// les attaques par force brute. Sans ça, un attaquant peut tester
// des milliers de mots de passe en quelques secondes.
//
// Installation : npm install express-rate-limit

import rateLimit from 'express-rate-limit';

// ── Login : 5 tentatives par IP sur 15 minutes ──────────────────────────────
// Pourquoi 5 ? Un utilisateur légitime qui oublie son mot de passe
// ne tentera pas plus de 5 fois d'affilée.
export const loginRateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              5,
  standardHeaders:  true,           // Renvoie RateLimit-* headers (RFC 6585)
  legacyHeaders:    false,
  skipSuccessfulRequests: true,     // Ne compte que les échecs
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    retryAfter: 15,
  },
  // LEÇON : En production, utilise un store Redis pour partager
  // les compteurs entre plusieurs instances de l'app :
  // store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
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