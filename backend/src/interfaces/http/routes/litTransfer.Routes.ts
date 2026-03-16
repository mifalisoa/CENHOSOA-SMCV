// backend/src/interfaces/http/routes/litTransferRoutes.ts

import { Router } from 'express';
import { LitTransferController } from '../controllers/LitTransferController';

const router = Router();
const controller = new LitTransferController();

// POST /patients/:id/transferer-lit
router.post('/:id/transferer-lit', (req, res) => controller.transferer(req, res));

// GET /patients/:id/historique-transferts
router.get('/:id/historique-transferts', (req, res) => controller.getHistorique(req, res));

export default router;