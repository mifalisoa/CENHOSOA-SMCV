// backend/src/interfaces/http/routes/dashboard.routes.ts

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

// GET /api/dashboard/stats — compteurs toutes les cartes
router.get('/stats', authMiddleware, (req, res) => controller.getStats(req, res));

// GET /api/dashboard/detail/:type?date=YYYY-MM-DD — liste patients d'une carte
// type: cardiologie | usic | ecg | ecg_dii_long | ett | eto | consultations
router.get('/detail/:type', authMiddleware, (req, res) => controller.getDetail(req, res));

export default router;