import { Router } from 'express';
import { CompteRenduController }         from '../controllers/CompteRenduController';
import { authMiddleware }                 from '../middlewares/auth.middleware';
import { roleMiddleware }                 from '../middlewares/role.middleware';
import { permissionMiddleware }           from '../middlewares/permission.middleware';
import { logAction }                      from '../middlewares/action-logger.middleware';
import { pool }                           from '../../../config/database';
import { PostgresCompteRenduRepository } from '../../../infrastructure/database/postgres/repositories/PostgresCompteRenduRepository';

const router = Router();
const compteRenduRepository = new PostgresCompteRenduRepository(pool);
const compteRenduController = new CompteRenduController(compteRenduRepository);

router.use(authMiddleware);

const LECTURE  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'];
const ECRITURE = ['admin', 'medecin', 'interne'];

router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('compte-rendu.write'),
  logAction('create', 'comptes_rendus'),
  compteRenduController.create
);

router.get('/patient/:patientId',
  roleMiddleware(LECTURE),
  permissionMiddleware('compte-rendu.read'),
  logAction('read', 'comptes_rendus'),
  compteRenduController.getByPatientId
);

router.get('/admission/:admissionId',
  roleMiddleware(LECTURE),
  permissionMiddleware('compte-rendu.read'),
  logAction('read', 'comptes_rendus'),
  compteRenduController.getByAdmissionId
);

router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('compte-rendu.read'),
  logAction('read', 'comptes_rendus'),
  compteRenduController.getById
);

router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('compte-rendu.write'),
  logAction('update', 'comptes_rendus'),
  compteRenduController.update
);

router.delete('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('compte-rendu.write'),
  logAction('delete', 'comptes_rendus'),
  compteRenduController.delete
);

export default router;