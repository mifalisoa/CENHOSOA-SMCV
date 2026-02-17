import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export interface JwtPayload {
    id_user: number;
    email_user: string;
    role_user: string;
}

export class JwtService {
    /**
     * Génère un access token
     */
    static generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    /**
     * Génère un refresh token
     */
    static generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    /**
     * Vérifie et décode un token
     */
    static verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        } catch (error) {
            throw new UnauthorizedError('Token invalide ou expiré');
        }
    }

    /**
     * Décode un token sans vérification (pour debug)
     */
    static decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch {
            return null;
        }
    }
}