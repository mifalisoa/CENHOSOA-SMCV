// backend/src/interfaces/http/routes/observation.routes.ts

import { Router } from 'express';
import { ObservationController }           from '../controllers/ObservationController';
import { authMiddleware }                   from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { pool }                             from '../../../config/database';
import { PostgresObservationRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';

const router = Router();
const observationRepository = new PostgresObservationRepository(pool);
const observationController = new ObservationController(observationRepository);

router.use(authMiddleware);

// Lecture — médecins, interne, stagiaire, infirmier, admin
const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
// Écriture — médecins, interne (pas stagiaire seul, pas infirmier)
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',                     roleMiddleware(ECRITURE), observationController.create);
router.get(   '/patient/:patientId',   roleMiddleware(LECTURE),  observationController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE), observationController.getByAdmissionId);
router.get(   '/:id',                  roleMiddleware(LECTURE),  observationController.getById);
router.put(   '/:id',                  roleMiddleware(ECRITURE), observationController.update);
router.delete('/:id',                  roleMiddleware(ECRITURE), observationController.delete);

export default router;