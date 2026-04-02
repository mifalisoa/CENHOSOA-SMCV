import { Router } from 'express';
import { ObservationController }         from '../controllers/ObservationController';
import { authMiddleware }                 from '../middlewares/auth.middleware';
import { roleMiddleware }                 from '../middlewares/role.middleware';
import { permissionMiddleware }           from '../middlewares/permission.middleware'; // ✅ nouveau
import { pool }                           from '../../../config/database';
import { PostgresObservationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';

const router = Router();
const observationRepository = new PostgresObservationRepository(pool);
const observationController = new ObservationController(observationRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post(  '/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  observationController.create
);

router.get(   '/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  observationController.getByPatientId
);

router.get(   '/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  observationController.getByAdmissionId
);

router.get(   '/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  observationController.getById
);

router.put(   '/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  observationController.update
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  observationController.delete
);

export default router;