import { Pool } from 'pg';
import { env } from './env';

// Configuration de la connexion PostgreSQL
export const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Événements de connexion
pool.on('connect', () => {
    console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erreur de connexion PostgreSQL:', err.message);
});

// Fonction pour tester la connexion
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Test de connexion PostgreSQL réussi');
        return true;
    } catch (error) {
        console.error('❌ Échec du test de connexion PostgreSQL:', error);
        throw error;
    }
};

export default pool;