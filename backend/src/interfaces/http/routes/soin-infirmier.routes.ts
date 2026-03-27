// backend/src/interfaces/http/routes/soin-infirmier.routes.ts

import { Router } from 'express';
import { SoinInfirmierController }           from '../controllers/SoinInfirmierController';
import { authMiddleware }                     from '../middlewares/auth.middleware';
import { roleMiddleware }                     from '../middlewares/role.middleware';
import { pool }                               from '../../../config/database';
import { PostgresSoinInfirmierRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';

const router = Router();
const soinRepository = new PostgresSoinInfirmierRepository(pool);
const soinController = new SoinInfirmierController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
// Infirmier peut créer/modifier les soins infirmiers
const ECRITURE = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];

router.post(  '/',                       roleMiddleware(ECRITURE), soinController.create);
router.get(   '/patient/:patientId',     roleMiddleware(LECTURE),  soinController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(LECTURE),  soinController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(LECTURE),  soinController.getById);
router.put(   '/:id',                    roleMiddleware(ECRITURE), soinController.update);
router.patch( '/:id/verify',             roleMiddleware(ECRITURE), soinController.verify);
router.delete('/:id',                    roleMiddleware(['admin', 'medecin', 'interne']), soinController.delete);

export default router;