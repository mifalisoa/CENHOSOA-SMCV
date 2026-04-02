import { Router } from 'express';
import { SoinMedicalController }         from '../controllers/SoinMedicalController';
import { authMiddleware }                 from '../middlewares/auth.middleware';
import { roleMiddleware }                 from '../middlewares/role.middleware';
import { permissionMiddleware }           from '../middlewares/permission.middleware'; // ✅ nouveau
import { pool }                           from '../../../config/database';
import { PostgresSoinMedicalRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinMedicalRepository';

const router = Router();
const soinRepository = new PostgresSoinMedicalRepository(pool);
const soinController = new SoinMedicalController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  soinController.create
);

router.get(   '/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getByPatientId
);

router.get(   '/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getByAdmissionId
);

router.get(   '/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getById
);

router.put(   '/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  soinController.update
);

router.patch( '/:id/verify',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  soinController.verify
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  soinController.delete
);

export default router;