// backend/src/interfaces/http/routes/litTransfer.Routes.ts

import { Router } from 'express';
import { LitTransferController } from '../controllers/LitTransferController';
import { authMiddleware }         from '../middlewares/auth.middleware';
import { logAction }              from '../middlewares/action-logger.middleware';

const router = Router();
const controller = new LitTransferController();

router.use(authMiddleware);

// Transfert de lit — action importante, loggée
router.post('/:id/transferer-lit',      logAction('update', 'lits'), (req, res) => controller.transferer(req, res));

// Historique — lecture, pas de log
router.get( '/:id/historique-transferts',                             (req, res) => controller.getHistorique(req, res));

export default router;