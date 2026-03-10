

import { Router } from 'express';
import { DocumentPatientExportController } from '../controllers/DocumentPatientExportController';

const router = Router();
const controller = new DocumentPatientExportController();

// Télécharger tous les documents d'un patient en ZIP
router.get('/patient/:patientId/zip', (req, res, next) => 
  controller.downloadAllZIP(req, res, next)
);

export default router;