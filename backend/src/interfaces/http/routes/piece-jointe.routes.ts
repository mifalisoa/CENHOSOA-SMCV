// backend/src/interfaces/http/routes/piece-jointe.routes.ts

import { Router } from 'express';
import { PieceJointeController } from '../controllers/PieceJointeController';
import { PostgresPieceJointeRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPieceJointeRepository';
import { pool } from '../../../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const repository = new PostgresPieceJointeRepository(pool);
const controller = new PieceJointeController(repository);

router.use(authMiddleware);

router.post('/',                              (req, res) => controller.create(req, res));
router.get('/:entiteType/:entiteId',           (req, res) => controller.getByEntite(req, res));
router.delete('/:id',                          (req, res) => controller.delete(req, res));

export default router;