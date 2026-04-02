import { Router } from 'express';
import { SoinInfirmierController }         from '../controllers/SoinInfirmierController';
import { authMiddleware }                   from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { permissionMiddleware }             from '../middlewares/permission.middleware'; // ✅ nouveau
import { pool }                             from '../../../config/database';
import { PostgresSoinInfirmierRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';

const router = Router();
const soinRepository = new PostgresSoinInfirmierRepository(pool);
const soinController = new SoinInfirmierController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];

router.post(  '/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  soinController.create
);

router.get(   '/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getByPatientId
);

router.get(   '/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getByAdmissionId
);

router.get(   '/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getById
);

router.put(   '/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  soinController.update
);

router.patch( '/:id/verify',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  soinController.verify
);

router.delete('/:id',
  roleMiddleware(['admin', 'medecin', 'interne']),
  permissionMiddleware('soins-infirmiers.write'),
  soinController.delete
);

export default router;