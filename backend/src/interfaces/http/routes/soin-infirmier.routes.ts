import { Router } from 'express';
import { SoinInfirmierController }         from '../controllers/SoinInfirmierController';
import { authMiddleware }                   from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { permissionMiddleware }             from '../middlewares/permission.middleware';
import { logAction }                        from '../middlewares/action-logger.middleware';
import { pool }                             from '../../../config/database';
import { PostgresSoinInfirmierRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';

const router = Router();
const soinRepository = new PostgresSoinInfirmierRepository(pool);
const soinController = new SoinInfirmierController(soinRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];

// Lecture — pas de log
router.get('/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getByPatientId
);
router.get('/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getByAdmissionId
);
router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('soins-infirmiers.read'),
  soinController.getById
);

// Écriture — loggée
router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  logAction('create', 'soins_infirmiers'),
  soinController.create
);
router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  logAction('update', 'soins_infirmiers'),
  soinController.update
);
router.patch('/:id/verify',
  roleMiddleware(ECRITURE),
  permissionMiddleware('soins-infirmiers.write'),
  logAction('update', 'soins_infirmiers'),
  soinController.verify
);
router.delete('/:id',
  roleMiddleware(['admin', 'medecin', 'interne']),
  permissionMiddleware('soins-infirmiers.write'),
  logAction('delete', 'soins_infirmiers'),
  soinController.delete
);

export default router;