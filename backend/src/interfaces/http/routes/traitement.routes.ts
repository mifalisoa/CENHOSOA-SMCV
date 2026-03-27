// backend/src/interfaces/http/routes/traitement.routes.ts

import { Router } from 'express';
import { TraitementController }           from '../controllers/TraitementController';
import { authMiddleware }                  from '../middlewares/auth.middleware';
import { roleMiddleware }                  from '../middlewares/role.middleware';
import { pool }                            from '../../../config/database';
import { PostgresTraitementRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';

const router = Router();
const traitementRepository = new PostgresTraitementRepository(pool);
const traitementController = new TraitementController(traitementRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',                       roleMiddleware(ECRITURE), traitementController.create);
router.get(   '/patient/:patientId',     roleMiddleware(LECTURE),  traitementController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE),  traitementController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(LECTURE),  traitementController.getById);
router.put(   '/:id',                    roleMiddleware(ECRITURE), traitementController.update);
router.delete('/:id',                    roleMiddleware(ECRITURE), traitementController.delete);

export default router;