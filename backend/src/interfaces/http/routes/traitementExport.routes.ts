// backend/src/interfaces/http/routes/traitementExportRoutes.ts

import { Router } from 'express';
import { TraitementExportController } from '../controllers/TraitementExportController';

const router = Router();
const controller = new TraitementExportController();

// Télécharger un traitement en PDF
router.get('/:id/pdf', (req, res, next) => 
  controller.downloadPDF(req, res, next)
);

// Télécharger tous les traitements d'un patient en ZIP
router.get('/patient/:patientId/zip', (req, res, next) => 
  controller.downloadAllZIP(req, res, next)
);

export default router;