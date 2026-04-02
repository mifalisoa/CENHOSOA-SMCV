import { Router } from 'express';
import { SoinMedicalController }         from '../controllers/SoinMedicalController';
import { authMiddleware }                 from '../middlewares/auth.middleware';
import { roleMiddleware }                 from '../middlewares/role.middleware';
import { permissionMiddleware }           from '../middlewares/permission.middleware';
import { logAction }                      from '../middlewares/action-logger.middleware';
import { pool }                           from '../../../config/database';
import { PostgresSoinMedicalRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinMedicalRepository';

const router = Router();
const soinRepository = new PostgresSoinMedicalRepository(pool);
const soinController = new SoinMedicalController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

// Lecture — pas de log
router.get('/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getByPatientId
);
router.get('/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getByAdmissionId
);
router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-medicaux.read'),
  soinController.getById
);

// Écriture — loggée
router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  logAction('create', 'soins_medicaux'),
  soinController.create
);
router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  logAction('update', 'soins_medicaux'),
  soinController.update
);
router.patch('/:id/verify',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  logAction('update', 'soins_medicaux'),
  soinController.verify
);
router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-medicaux.write'),
  logAction('delete', 'soins_medicaux'),
  soinController.delete
);

export default router;