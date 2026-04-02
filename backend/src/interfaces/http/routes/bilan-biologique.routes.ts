import { Router } from 'express';
import { BilanBiologiqueController }         from '../controllers/BilanBiologiqueController';
import { authMiddleware }                     from '../middlewares/auth.middleware';
import { roleMiddleware }                     from '../middlewares/role.middleware';
import { permissionMiddleware }               from '../middlewares/permission.middleware'; // ✅ nouveau
import { pool }                               from '../../../config/database';
import { PostgresBilanBiologiqueRepository } from '../../../infrastructure/database/postgres/repositories/PostgresBilanBiologiqueRepository';

const router = Router();
const bilanRepository = new PostgresBilanBiologiqueRepository(pool);
const bilanController = new BilanBiologiqueController(bilanRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('bilans.write'),
  bilanController.create
);

router.get(   '/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('bilans.read'),
  bilanController.getByPatientId
);

router.get(   '/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('bilans.read'),
  bilanController.getByAdmissionId
);

router.get(   '/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('bilans.read'),
  bilanController.getById
);

router.put(   '/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('bilans.write'),
  bilanController.update
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('bilans.write'),
  bilanController.delete
);

export default router;