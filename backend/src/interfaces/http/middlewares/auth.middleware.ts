import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../../infrastructure/security/jwt.service';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';

export interface AuthRequest extends Request {
    user?: {
        id_user: number;
        email_user: string;
        role_user: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token manquant');
        }

        const token = authHeader.substring(7);
        const payload = JwtService.verifyToken(token);

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
};