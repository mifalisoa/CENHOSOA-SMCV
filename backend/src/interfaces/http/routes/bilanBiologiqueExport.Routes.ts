// backend/src/interfaces/http/routes/bilanBiologiqueExportRoutes.ts

import { Router } from 'express';
import { BilanBiologiqueExportController } from '../controllers/BilanBiologiqueExportController';

const router = Router();
const controller = new BilanBiologiqueExportController();

// Télécharger un bilan en PDF
router.get('/:id/pdf', (req, res, next) => 
  controller.downloadPDF(req, res, next)
);

// Télécharger tous les bilans d'un patient en ZIP
router.get('/patient/:patientId/zip', (req, res, next) => 
  controller.downloadAllZIP(req, res, next)
);

export default router;