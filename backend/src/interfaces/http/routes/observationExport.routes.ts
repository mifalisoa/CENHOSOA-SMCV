import { Router } from 'express';
import { ObservationExportController } from '../controllers/ObservationExportController';
import { authMiddleware } from '../middlewares/auth.middleware'; 

const router = Router();
const controller = new ObservationExportController();


router.get('/:id/pdf', authMiddleware, (req, res, next) => 
  controller.downloadPDF(req, res, next)
);


router.get('/patient/:patientId/zip', authMiddleware, (req, res, next) => 
  controller.downloadAllZIP(req, res, next)
);

export default router;