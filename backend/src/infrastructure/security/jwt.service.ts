// backend/src/infrastructure/security/jwt.service.ts

import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';

export interface JwtPayload {
    id_user: number;
    email: string;   // était email_user
    role: string;    // était role_user
     nom: string;
    prenom: string;

}

export class JwtService {
    static generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    static generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    static verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        } catch {
            throw new UnauthorizedError('Token invalide ou expiré');
        }
    }

    static decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch {
            return null;
        }
    }
}