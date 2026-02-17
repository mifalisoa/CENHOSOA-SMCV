import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { env } from '../../../config/env';
import { errorResponse } from '../../../shared/utils/response.utils';

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(
            errorResponse(error.message, env.isDevelopment ? error.stack : undefined)
        );
    }

    // Erreur inattendue
    console.error('Erreur non gérée:', error);

    return res.status(500).json(
        errorResponse(
            'Erreur interne du serveur',
            env.isDevelopment ? error.message : undefined
        )
    );
};