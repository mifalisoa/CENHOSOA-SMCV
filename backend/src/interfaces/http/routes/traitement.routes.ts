import { Router } from 'express';
import { TraitementController }         from '../controllers/TraitementController';
import { authMiddleware }                from '../middlewares/auth.middleware';
import { roleMiddleware }                from '../middlewares/role.middleware';
import { permissionMiddleware }          from '../middlewares/permission.middleware';
import { logAction }                     from '../middlewares/action-logger.middleware';
import { pool }                          from '../../../config/database';
import { PostgresTraitementRepository } from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';

const router = Router();
const traitementRepository = new PostgresTraitementRepository(pool);
const traitementController = new TraitementController(traitementRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

// Lecture — pas de log
router.get('/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getByPatientId
);
router.get('/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getByAdmissionId
);
router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('prescriptions.read'),
  traitementController.getById
);

// Écriture — loggée
router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  logAction('create', 'traitements'),
  traitementController.create
);
router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  logAction('update', 'traitements'),
  traitementController.update
);
router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('prescriptions.write'),
  logAction('delete', 'traitements'),
  traitementController.delete
);

export default router;