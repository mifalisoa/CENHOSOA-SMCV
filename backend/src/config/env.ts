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
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
};