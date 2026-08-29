// backend/src/main.ts
//
// CHANGEMENT : apiRateLimiter branche sur toutes les routes /api.
// Le fichier existait deja (rateLimiter.middleware.ts) mais n'etait
// importe nulle part, donc totalement inactif.
// loginRateLimiter (plus strict, 5/15min) reste sur /auth/login specifiquement
// (voir auth.routes.ts) : les deux se cumulent sans probleme, apiRateLimiter
// couvre le reste de l'API que loginRateLimiter ne voit pas.

import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import { createServer } from 'http';
import { env }        from './config/env';
import { testConnection } from './config/database';
import { initSocketIO }   from './config/socket';
import routes         from './interfaces/http/routes';
import { errorMiddleware } from './interfaces/http/middlewares/error.middleware';
import { apiRateLimiter, uploadsReadRateLimiter } from './interfaces/http/middlewares/rateLimiter.middleware';
import path           from 'path';

const app = express();

// ── Middlewares globaux ───────────────────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'null',
    ];
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
// En attendant, ce rate limiter ralentit au moins le scraping automatise
// en masse d'URLs de fichiers.
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
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
};

start();