// backend/src/main.ts

import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import { createServer } from 'http';
import { env }        from './config/env';
import { testConnection } from './config/database';
import { initSocketIO }   from './config/socket';
import routes         from './interfaces/http/routes';
import { errorMiddleware } from './interfaces/http/middlewares/error.middleware';
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, _res, next) => {
  console.log(`📨 [${req.method}] ${req.url}`);
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

app.use('/api', routes);

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

    // LEÇON : On crée un serveur HTTP explicite pour pouvoir y attacher Socket.io.
    // Avant : app.listen() créait un serveur HTTP implicitement.
    // Après : createServer(app) + initSocketIO(httpServer) partagent le même port.
    const httpServer = createServer(app);
    initSocketIO(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║        🏥  CENHOSOA-SMCV Backend API  🏥       ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`🚀 Serveur démarré sur http://localhost:${env.PORT}`);
      console.log(`🔌 Socket.io activé sur ws://localhost:${env.PORT}`);
      console.log(`📊 Environnement: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
};

start();