// backend/src/interfaces/http/routes/stats.routes.ts

import { Router } from 'express';
import { StatsController } from '../controllers/StatsController';
import { authMiddleware }   from '../middlewares/auth.middleware';
import { roleMiddleware }   from '../middlewares/role.middleware';

const router     = Router();
const controller = new StatsController();

// Réservé admin uniquement
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', (req, res) => controller.getStats(req, res));

export default router;