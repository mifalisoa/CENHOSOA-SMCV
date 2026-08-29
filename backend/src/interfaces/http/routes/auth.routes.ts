import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
// NOUVEAU : rate limiter sur le login. Le fichier existait deja
// (rateLimiter.middleware.ts) mais n'etait importe nulle part.
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

// Dependency Injection
const utilisateurRepository = new PostgresUtilisateurRepository(pool);
const loginUser = new LoginUser(utilisateurRepository);
const authController = new AuthController(loginUser);

const router = Router();

// loginRateLimiter avant validateRequest : on veut bloquer les tentatives
// en trop AVANT de perdre du temps a valider le format du body.
router.post('/login', loginRateLimiter, validateRequest(loginSchema), authController.login);

router.get('/me', authMiddleware, authController.me);

// Logout — supprime la session active et log la déconnexion
router.post('/logout', authMiddleware, authController.logout);

router.post('/changer-mot-de-passe', authMiddleware, authController.changerMotDePasse);

export default router;