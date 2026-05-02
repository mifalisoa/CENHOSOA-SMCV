import { Router } from 'express';
import { EvolutionPatientController }           from '../controllers/EvolutionPatientController';
import { authMiddleware }                        from '../middlewares/auth.middleware';
import { roleMiddleware }                        from '../middlewares/role.middleware';
import { permissionMiddleware }                  from '../middlewares/permission.middleware';
import { logAction }                             from '../middlewares/action-logger.middleware';
import { pool }                                  from '../../../config/database';
import { PostgresEvolutionPatientRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresEvolutionPatientRepository';
import { PostgresObservationRepository }        from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';

const router = Router();

const evolutionRepository  = new PostgresEvolutionPatientRepository(pool);
const observationRepository = new PostgresObservationRepository(pool);
const controller = new EvolutionPatientController(evolutionRepository, observationRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  logAction('create', 'evolution_patient'),
  controller.create
);

router.get('/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  controller.getByPatientId
);

router.get('/observation/:observationId',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  controller.getByObservationId
);

router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('observations.read'),
  controller.getById
);

router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  logAction('update', 'evolution_patient'),
  controller.update
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('observations.write'),
  logAction('delete', 'evolution_patient'),
  controller.delete
);

export default router;