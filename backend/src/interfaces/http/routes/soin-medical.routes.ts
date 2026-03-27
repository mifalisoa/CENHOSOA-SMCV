// backend/src/interfaces/http/routes/soin-medical.routes.ts

import { Router } from 'express';
import { SoinMedicalController }           from '../controllers/SoinMedicalController';
import { authMiddleware }                   from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { pool }                             from '../../../config/database';
import { PostgresSoinMedicalRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresSoinMedicalRepository';

const router = Router();
const soinRepository = new PostgresSoinMedicalRepository(pool);
const soinController = new SoinMedicalController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',                       roleMiddleware(ECRITURE), soinController.create);
router.get(   '/patient/:patientId',     roleMiddleware(LECTURE),  soinController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE),  soinController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(LECTURE),  soinController.getById);
router.put(   '/:id',                    roleMiddleware(ECRITURE), soinController.update);
router.patch( '/:id/verify',             roleMiddleware(ECRITURE), soinController.verify);
router.delete('/:id',                    roleMiddleware(ECRITURE), soinController.delete);

export default router;