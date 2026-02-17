import { Router } from 'express';
import { LitController } from '../controllers/LitController';
import { GetAvailableLits } from '../../../application/use-cases/lit/GetAvailableLits';
import { GetAllLits } from '../../../application/use-cases/lit/GetAllLits';
import { PostgresLitRepository } from '../../../infrastructure/database/postgres/repositories/PostgresLitRepository';
import { pool } from '../../../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';

// Dependency Injection
const litRepository = new PostgresLitRepository(pool);
const getAvailableLits = new GetAvailableLits(litRepository);
const getAllLits = new GetAllLits(litRepository);

const litController = new LitController(getAvailableLits, getAllLits);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/lits
 * @desc Liste de tous les lits
 * @access Private
 */
router.get('/', litController.getAll);

/**
 * @route GET /api/lits/available
 * @desc Liste des lits disponibles (avec filtre service optionnel)
 * @access Private
 */
router.get('/available', litController.getAvailable);

export default router;