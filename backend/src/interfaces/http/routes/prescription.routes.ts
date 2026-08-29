import { Router } from 'express';
import { PrescriptionController }            from '../controllers/PrescriptionController';
import { CreatePrescription }                from '../../../application/use-cases/prescription/CreatePrescription';
import { GetPrescriptionsByAdmission }       from '../../../application/use-cases/prescription/GetPrescriptionsByAdmission';
import { UpdatePrescription }                from '../../../application/use-cases/prescription/UpdatePrescription';
import { PostgresPrescriptionRepository }    from '../../../infrastructure/database/postgres/repositories/PostgresPrescriptionRepository';
import { PostgresAdmissionRepository }       from '../../../infrastructure/database/postgres/repositories/PostgresAdmissionRepository';
import { PostgresUtilisateurRepository }     from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool }                              from '../../../config/database';
import { validateRequest }                   from '../middlewares/validation.middleware';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../validators/prescription.validator';
import { authMiddleware }                    from '../middlewares/auth.middleware';
import { roleMiddleware }                    from '../middlewares/role.middleware';
import { logAction }                         from '../middlewares/action-logger.middleware';
import { ROLES_VALIDATEURS }                 from '../../../shared/types';

const prescriptionRepository  = new PostgresPrescriptionRepository(pool);
const admissionRepository     = new PostgresAdmissionRepository(pool);
const utilisateurRepository   = new PostgresUtilisateurRepository(pool);

const createPrescription          = new CreatePrescription(prescriptionRepository, admissionRepository, utilisateurRepository);
const getPrescriptionsByAdmission = new GetPrescriptionsByAdmission(prescriptionRepository);
const updatePrescription          = new UpdatePrescription(prescriptionRepository);

const prescriptionController = new PrescriptionController(
  createPrescription,
  getPrescriptionsByAdmission,
  updatePrescription,
  prescriptionRepository
);

const router = Router();
router.use(authMiddleware);

const ECRITURE = ['admin', 'medecin', 'interne'];

router.get('/admission/:idAdmission', prescriptionController.getByAdmission);

router.post('/',
  roleMiddleware(ECRITURE),
  validateRequest(createPrescriptionSchema),
  logAction('create', 'prescriptions'),
  prescriptionController.create
);

router.patch('/:id',
  roleMiddleware(ECRITURE),
  validateRequest(updatePrescriptionSchema),
  logAction('update', 'prescriptions'),
  prescriptionController.update
);

router.patch('/:id/valider',
  roleMiddleware(ROLES_VALIDATEURS),
  logAction('update', 'prescriptions'),
  prescriptionController.valider
);

export default router;