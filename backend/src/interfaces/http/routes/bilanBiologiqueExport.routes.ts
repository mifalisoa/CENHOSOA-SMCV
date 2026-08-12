import { Router } from 'express';
import { BilanBiologiqueExportController } from '../controllers/BilanBiologiqueExportController';
import { authMiddleware } from '../middlewares/auth.middleware'; // Assure-toi que l'import est correct
import { logAction } from '../middlewares/action-logger.middleware';

const router = Router();
const controller = new BilanBiologiqueExportController();

// Télécharger un bilan en PDF
// Action: read | Module: bilans
router.get('/:id/pdf', 
  authMiddleware, 
  logAction('read', 'bilans'), 
  (req, res, next) => controller.downloadPDF(req, res, next)
);

// Télécharger tous les bilans d'un patient en ZIP
// Action: read | Module: bilans
router.get('/patient/:patientId/zip', 
  authMiddleware, 
  logAction('read', 'bilans'), 
  (req, res, next) => controller.downloadAllZIP(req, res, next)
);

export default router;