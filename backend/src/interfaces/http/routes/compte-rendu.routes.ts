// backend/src/interfaces/http/routes/compte-rendu.routes.ts

import { Router } from 'express';
import { CompteRenduController }           from '../controllers/CompteRenduController';
import { authMiddleware }                   from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { pool }                             from '../../../config/database';
import { PostgresCompteRenduRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresCompteRenduRepository';

const router = Router();
const compteRenduRepository = new PostgresCompteRenduRepository(pool);
const compteRenduController = new CompteRenduController(compteRenduRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',                       roleMiddleware(ECRITURE), compteRenduController.create);
router.get(   '/patient/:patientId',     roleMiddleware(LECTURE),  compteRenduController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE),  compteRenduController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(LECTURE),  compteRenduController.getById);
router.put(   '/:id',                    roleMiddleware(ECRITURE), compteRenduController.update);
router.delete('/:id',                    roleMiddleware(ECRITURE), compteRenduController.delete);

export default router;