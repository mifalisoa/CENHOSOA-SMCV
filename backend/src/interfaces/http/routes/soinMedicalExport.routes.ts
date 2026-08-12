

import { Router } from 'express';
import { SoinMedicalExportController } from '../controllers/SoinMedicalExportController';

const router = Router();
const controller = new SoinMedicalExportController();

// Télécharger un soin en PDF
router.get('/:id/pdf', (req, res, next) => 
  controller.downloadPDF(req, res, next)
);

// Télécharger tous les soins d'un patient en ZIP
router.get('/patient/:patientId/zip', (req, res, next) => 
  controller.downloadAllZIP(req, res, next)
);

export default router;