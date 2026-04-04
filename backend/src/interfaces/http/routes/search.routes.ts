// backend/src/interfaces/http/routes/search.routes.ts

import { Router }         from 'express';
import { SearchController } from '../controllers/SearchController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router     = Router();
const controller = new SearchController();

// GET /api/search?q=terme
router.get('/', authMiddleware, (req, res) => controller.search(req, res));

export default router;