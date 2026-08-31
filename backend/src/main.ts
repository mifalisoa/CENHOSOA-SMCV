// backend/src/main.ts
//
// CHANGEMENT : la liste d'origines CORS vient maintenant de env.ts
// (getAllowedOrigins(), lui-meme derive de CORS_ORIGIN dans .env) au lieu
// d'un tableau ecrit en dur. Changer d'environnement (dev -> prod) ne
// demande plus de modifier le code, juste le .env du serveur.
//
// Retire au passage l'origine 'null' de la liste (cas special rarement
// necessaire, jamais identifie comme utile dans ce projet). Si quelque
// chose casse a cause de ca, ajouter 'null' dans CORS_ORIGIN suffit --
// pas besoin de retoucher ce fichier.
//
// Ajoute aussi checkCriticalSecrets() au demarrage : bloque le lancement
// en production si JWT_SECRET ou DB_PASSWORD sont restes a leur valeur
// par defaut non securisee.

import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import { createServer } from 'http';
import { env, getAllowedOrigins, checkCriticalSecrets } from './config/env';
import { testConnection } from './config/database';
import { initSocketIO }   from './config/socket';
import routes         from './interfaces/http/routes';
import { errorMiddleware } from './interfaces/http/middlewares/error.middleware';
import { apiRateLimiter, uploadsReadRateLimiter } from './interfaces/http/middlewares/rateLimiter.middleware';
import { ipBlockMiddleware } from './interfaces/http/middlewares/ipBlock.middleware';
import path           from 'path';

checkCriticalSecrets();

const app = express();

// ── Middlewares globaux ───────────────────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// NOUVEAU : verifie ips_bloquees en tout premier, avant meme le parsing du
// body. Une IP bloquee est rejetee avant que quoi que ce soit d'autre ne
// s'execute -- y compris sur /auth/login.
app.use(ipBlockMiddleware);

app.use(cors({
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// MITIGATION PARTIELLE (pas une vraie protection) : ces fichiers restent
// accessibles sans authentification -- voir l'audit securite pour le
// chantier complet, volontairement reporte apres la livraison de septembre
// vu son impact sur le frontend (affichage des documents/images).
app.use('/uploads', uploadsReadRateLimiter, express.static(path.join(__dirname, '../uploads')));

app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ── Routes de santé ───────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'API CENHOSOA SMCV', version: '1.0.0' });
});

// ── Routes API ────────────────────────────────────────────────────────────────

app.use('/api', apiRateLimiter, routes);

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ── Error middleware ──────────────────────────────────────────────────────────

app.use(errorMiddleware);

// ── Démarrage ─────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await testConnection();

    const httpServer = createServer(app);
    initSocketIO(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log('================================================');
      console.log('        CENHOSOA-SMCV Backend API');
      console.log('================================================');
      console.log(`Serveur démarré sur http://localhost:${env.PORT}`);
      console.log(`Socket.io activé sur ws://localhost:${env.PORT}`);
      console.log(`Environnement: ${env.NODE_ENV}`);
      console.log(`Origines CORS autorisées: ${getAllowedOrigins().join(', ')}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
};

start();