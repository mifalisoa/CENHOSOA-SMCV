import { Router } from 'express';
import { TraitementController }         from '../controllers/TraitementController';
import { authMiddleware }                from '../middlewares/auth.middleware';
import { roleMiddleware }                from '../middlewares/role.middleware';
import { permissionMiddleware }          from '../middlewares/permission.middleware'; // ✅ nouveau
import { pool }                          from '../../../config/database';
import { PostgresTraitementRepository } from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';

const router = Router();
const traitementRepository  = new PostgresTraitementRepository(pool);
const traitementController  = new TraitementController(traitementRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  traitementController.create
);

router.get(   '/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getByPatientId
);

router.get(   '/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getByAdmissionId
);

router.get(   '/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getById
);

router.put(   '/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  traitementController.update
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  traitementController.delete
);

export default router;