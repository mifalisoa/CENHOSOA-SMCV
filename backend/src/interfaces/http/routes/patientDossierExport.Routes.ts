// backend/src/interfaces/http/routes/patientDossierExportRoutes.ts

import { Router } from 'express';
import { PatientDossierExportController } from '../controllers/PatientDossierExportController';

const router = Router();
const controller = new PatientDossierExportController();

/**
 * GET /api/patients/:patientId/dossier-complet/zip
 * Télécharger TOUT le dossier patient en ZIP
 * Contient : Observations, Bilans, Soins médicaux, Soins infirmiers, Traitements, Documents
 */
router.get('/:patientId/dossier-complet/zip', (req, res, next) => 
  controller.downloadDossierComplet(req, res, next)
);

export default router;