// backend/src/interfaces/http/routes/patientTransfer.Routes.ts

import { Router } from 'express';
import { PatientTransferController } from '../controllers/PatientTransferController';
import { authMiddleware }             from '../middlewares/auth.middleware';
import { logAction }                  from '../middlewares/action-logger.middleware';

const router     = Router();
const controller = new PatientTransferController();

router.use(authMiddleware);

// Transferts — loggés (changement de statut patient important)
router.post('/:id/hospitaliser',    logAction('update', 'patients'), (req, res, next) => controller.hospitaliser(req, res, next));
router.post('/:id/rendre-externe',  logAction('update', 'patients'), (req, res, next) => controller.rendreExterne(req, res, next));

// Lecture — pas de log
router.get( '/:id/admission-active',                                 (req, res, next) => controller.getAdmissionActive(req, res, next));

export default router;