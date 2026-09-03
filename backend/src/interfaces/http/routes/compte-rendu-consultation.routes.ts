import { Router } from 'express';
import { CompteRenduConsultationController } from '../controllers/CompteRenduConsultationController';
import { PostgresCompteRenduConsultationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresCompteRenduConsultationRepository';
import { pool } from '../../../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { logAction } from '../middlewares/action-logger.middleware';

const repository = new PostgresCompteRenduConsultationRepository(pool);
const controller = new CompteRenduConsultationController(repository);

const router = Router();
router.use(authMiddleware);

// Lecture — pas de log
router.get('/patient/:patientId', permissionMiddleware('compte-rendu.read'), controller.getByPatientId);
router.get('/:id/pdf',            permissionMiddleware('compte-rendu.read'), controller.getPDF);
router.get('/:id',                permissionMiddleware('compte-rendu.read'), controller.getById);

// Ecriture — loggee
router.post('/',
  permissionMiddleware('compte-rendu.write'),
  logAction('create', 'comptes_rendus_consultation'),
  controller.create
);

router.put('/:id',
  permissionMiddleware('compte-rendu.write'),
  logAction('update', 'comptes_rendus_consultation'),
  controller.update
);

router.delete('/:id',
  permissionMiddleware('compte-rendu.write'),
  logAction('delete', 'comptes_rendus_consultation'),
  controller.delete
);

export default router;