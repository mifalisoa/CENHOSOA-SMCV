// backend/src/interfaces/http/routes/bilan-biologique.routes.ts

import { Router } from 'express';
import { BilanBiologiqueController }           from '../controllers/BilanBiologiqueController';
import { authMiddleware }                       from '../middlewares/auth.middleware';
import { roleMiddleware }                       from '../middlewares/role.middleware';
import { pool }                                 from '../../../config/database';
import { PostgresBilanBiologiqueRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresBilanBiologiqueRepository';

const router = Router();
const bilanRepository = new PostgresBilanBiologiqueRepository(pool);
const bilanController = new BilanBiologiqueController(bilanRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',                       roleMiddleware(ECRITURE), bilanController.create);
router.get(   '/patient/:patientId',     roleMiddleware(LECTURE),  bilanController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE),  bilanController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(LECTURE),  bilanController.getById);
router.put(   '/:id',                    roleMiddleware(ECRITURE), bilanController.update);
router.delete('/:id',                    roleMiddleware(ECRITURE), bilanController.delete);

export default router;