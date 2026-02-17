import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../../shared/errors/ValidationError';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Debug: On vérifie ce qu'on reçoit
            console.log("🛠 Validation en cours pour:", req.originalUrl);

            // C'est ICI que ça se joue : on donne à Zod l'objet complet
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const messages = error.issues
                    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                    .join(', ');
                
                console.error("❌ Erreur de validation Zod:", messages);
                return next(new ValidationError(messages));
            }
            next(error);
        }
    };
};