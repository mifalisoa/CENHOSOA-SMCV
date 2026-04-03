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
const loginUser    = new LoginUser(utilisateurRepository);
const registerUser = new RegisterUser(utilisateurRepository);
const authController = new AuthController(loginUser, registerUser);

const router = Router();

router.post('/login',    validateRequest(loginSchema),    authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);
router.get( '/me',       authMiddleware,                  authController.me);

// ✅ Logout — supprime la session active et log la déconnexion
router.post('/logout',   authMiddleware,                  authController.logout);

router.post('/changer-mot-de-passe', authMiddleware, authController.changerMotDePasse);

export default router;