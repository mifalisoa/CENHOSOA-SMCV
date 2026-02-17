import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser } from '../../../application/use-cases/auth/RegisterUser';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

// Dependency Injection
const utilisateurRepository = new PostgresUtilisateurRepository(pool);
const loginUser = new LoginUser(utilisateurRepository);
const registerUser = new RegisterUser(utilisateurRepository);
const authController = new AuthController(loginUser, registerUser);

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Connexion utilisateur
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route POST /api/auth/register
 * @desc Inscription utilisateur
 * @access Public (ou protégé selon vos besoins)
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route GET /api/auth/me
 * @desc Obtenir l'utilisateur connecté
 * @access Private
 */
router.get('/me', authMiddleware, authController.me);

export default router;