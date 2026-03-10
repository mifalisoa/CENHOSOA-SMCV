// backend/src/interfaces/http/routes/patientTransferRoutes.ts

import { Router } from 'express';
import { PatientTransferController } from '../controllers/PatientTransferController';

const router = Router();
const controller = new PatientTransferController();

// Hospitaliser un patient externe
router.post('/:id/hospitaliser', (req, res, next) => 
  controller.hospitaliser(req, res, next)
);

// Rendre externe un patient hospitalisé
router.post('/:id/rendre-externe', (req, res, next) => 
  controller.rendreExterne(req, res, next)
);

// Récupérer l'admission active
router.get('/:id/admission-active', (req, res, next) => 
  controller.getAdmissionActive(req, res, next)
);

export default router;