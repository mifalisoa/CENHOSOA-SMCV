import dotenv from 'dotenv';

dotenv.config();

export const env = {
    // Application
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_VERSION: process.env.API_VERSION || 'v1',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'postgres',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Security
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // CORS
    // CHANGEMENT : CORS_ORIGIN accepte maintenant plusieurs origines separees
    // par des virgules (ex: "https://cenhosoa-smcv.mg,https://www.cenhosoa-smcv.mg").
    // En dev, la valeur par defaut couvre les 3 origines locales utilisees
    // jusqu'ici en dur dans main.ts.
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000',

    // Helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',

    // Email (Nodemailer)
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    SMTP_FROM: process.env.SMTP_FROM || 'CENHOSOA-SMCV <mifalyandrianandraina93@gmail.com>',
};

// Derive la liste d'origines autorisees a partir de CORS_ORIGIN.
// Fonction separee (pas juste une propriete calculee dans l'objet ci-dessus)
// pour rester lisible : .split/.map/.filter directement dans un litteral
// d'objet aurait ete plus difficile a suivre.
export function getAllowedOrigins(): string[] {
    return env.CORS_ORIGIN.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
}

// Garde-fou : empeche le demarrage en production si les secrets critiques
// sont restes a leur valeur par defaut (ex: .env manquant ou mal copie lors
// du deploiement). En dev, seul un avertissement est affiche -- ne bloque pas
// le travail quotidien.
const DEFAULT_JWT_SECRET = 'change-this-secret';

export function checkCriticalSecrets(): void {
    const usingDefaultSecret = env.JWT_SECRET === DEFAULT_JWT_SECRET;
    const missingDbPassword  = !env.DB_PASSWORD;

    if (!usingDefaultSecret && !missingDbPassword) return;

    const problems: string[] = [];
    if (usingDefaultSecret)  problems.push('JWT_SECRET est encore la valeur par defaut');
    if (missingDbPassword)   problems.push('DB_PASSWORD est vide');

    if (env.isProduction) {
        throw new Error(
            `Configuration de securite invalide en production : ${problems.join(', ')}. ` +
            `Verifie le fichier .env avant de demarrer le serveur.`
        );
    }

    console.warn(
        `[env] Attention : ${problems.join(', ')}. ` +
        `A corriger avant tout deploiement en production.`
    );
}