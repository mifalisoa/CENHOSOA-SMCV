import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { testConnection } from './config/database';
import routes from './interfaces/http/routes';
import { errorMiddleware } from './interfaces/http/middlewares/error.middleware';
import path from 'path';

const app = express();

// ==========================================
// MIDDLEWARES GLOBAUX
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ CORS CORRIGÉ - Autoriser plusieurs origines
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'null'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.urlencoded({ extended: true }));

// ✅ LOG DES REQUÊTES (pour debug)
app.use((req, res, next) => {
    console.log(`📨 [${req.method}] ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    console.log(`📦 Body:`, JSON.stringify(req.body));
    console.log(`📋 Content-Type:`, req.headers['content-type']);
    next();
});

// ==========================================
// ROUTES DE SANTÉ
// ==========================================
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'cenhosoa-backend',
        environment: env.NODE_ENV,
    });
});

app.get('/', (_req, res) => {
    res.json({
        message: 'API CENHOSOA SMCV',
        version: '1.0.0',
        environment: env.NODE_ENV,
        modules: {
            auth: '/api/auth',
            patients: '/api/patients',
            observations: '/api/observations',
            bilans_biologiques: '/api/bilans-biologiques',
            soins_medicaux: '/api/soins-medicaux',
            soins_infirmiers: '/api/soins-infirmiers',
            traitements: '/api/traitements',
            documents: '/api/documents-patients',
            comptes_rendus: '/api/comptes-rendus',
        },
    });
});

// ==========================================
// ROUTES API
// ==========================================
app.use('/api', routes);

// ==========================================
// GESTION DES ERREURS 404
// ==========================================
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        timestamp: new Date().toISOString(),
    });
});

// ==========================================
// MIDDLEWARE DE GESTION D'ERREURS
// ==========================================
app.use(errorMiddleware);

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
const start = async () => {
    try {
        await testConnection();

        app.listen(env.PORT, () => {
            console.log('╔════════════════════════════════════════════════╗');
            console.log('║                                                ║');
            console.log('║        🏥  CENHOSOA-SMCV Backend API  🏥       ║');
            console.log('║                                                ║');
            console.log('╚════════════════════════════════════════════════╝');
            console.log('');
            console.log(`🚀 Serveur démarré sur http://localhost:${env.PORT}`);
            console.log(`📊 Environnement: ${env.NODE_ENV}`);
            console.log(`🗄️  Base de données: ${env.DB_NAME}`);
            console.log(`🔐 JWT Secret: ${env.JWT_SECRET.substring(0, 10)}...`);
            console.log('');
            console.log('📋 Endpoints disponibles:');
            console.log('');
            console.log('   🔐 AUTHENTIFICATION');
            console.log('   POST /api/auth/login         - Connexion');
            console.log('   POST /api/auth/register      - Inscription');
            console.log('   GET  /api/auth/me            - Profil utilisateur');
            console.log('');
            console.log('   👥 PATIENTS');
            console.log('   GET  /api/patients           - Liste des patients');
            console.log('   POST /api/patients           - Créer un patient');
            console.log('   GET  /api/patients/:id       - Détails d\'un patient');
            console.log('');
            console.log('   📋 OBSERVATIONS MÉDICALES');
            console.log('   POST /api/observations       - Créer une observation');
            console.log('   GET  /api/observations/patient/:patientId - Par patient');
            console.log('   GET  /api/observations/admission/:admissionId - Par admission');
            console.log('');
            console.log('   🧪 BILANS BIOLOGIQUES');
            console.log('   POST /api/bilans-biologiques - Créer un bilan');
            console.log('   GET  /api/bilans-biologiques/patient/:patientId - Par patient');
            console.log('');
            console.log('   🏥 SOINS MÉDICAUX');
            console.log('   POST /api/soins-medicaux     - Créer un soin médical');
            console.log('   GET  /api/soins-medicaux/patient/:patientId - Par patient');
            console.log('   PATCH /api/soins-medicaux/:id/verify - Vérifier un soin');
            console.log('');
            console.log('   💉 SOINS INFIRMIERS');
            console.log('   POST /api/soins-infirmiers   - Créer un soin infirmier');
            console.log('   GET  /api/soins-infirmiers/patient/:patientId - Par patient');
            console.log('   PATCH /api/soins-infirmiers/:id/verify - Vérifier un soin');
            console.log('');
            console.log('   💊 TRAITEMENTS');
            console.log('   POST /api/traitements        - Créer un traitement');
            console.log('   GET  /api/traitements/patient/:patientId - Par patient');
            console.log('');
            console.log('   📄 DOCUMENTS PATIENTS');
            console.log('   POST /api/documents-patients - Ajouter un document');
            console.log('   GET  /api/documents-patients/patient/:patientId - Par patient');
            console.log('');
            console.log('   📝 COMPTES RENDUS');
            console.log('   POST /api/comptes-rendus     - Créer un compte rendu');
            console.log('   GET  /api/comptes-rendus/patient/:patientId - Par patient');
            console.log('   GET  /api/comptes-rendus/admission/:admissionId - Par admission');
            console.log('');
            console.log('✨ Prêt à recevoir des requêtes!');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erreur au démarrage du serveur:', error);
        process.exit(1);
    }
};

start();