import { Router } from 'express';
import { AdmissionController } from '../controllers/AdmissionController';
import { CreateAdmission } from '../../../application/use-cases/admission/CreateAdmission';
import { GetAdmissionById } from '../../../application/use-cases/admission/GetAdmissionById';
import { ListAdmissions } from '../../../application/use-cases/admission/ListAdmissions';
import { GetAdmissionsEnCours } from '../../../application/use-cases/admission/GetAdmissionsEnCours';
import { AssignLit } from '../../../application/use-cases/admission/AssignLit';
import { CloturerAdmission } from '../../../application/use-cases/admission/CloturerAdmission';
import { PostgresAdmissionRepository } from '../../../infrastructure/database/postgres/repositories/PostgresAdmissionRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { PostgresLitRepository } from '../../../infrastructure/database/postgres/repositories/PostgresLitRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { createAdmissionSchema, assignLitSchema } from '../validators/admission.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware'; // ✅ nouveau
import { ROLES } from '../../../config/constants';

// Dependency Injection
const admissionRepository   = new PostgresAdmissionRepository(pool);
const patientRepository     = new PostgresPatientRepository(pool);
const utilisateurRepository = new PostgresUtilisateurRepository(pool);
const litRepository         = new PostgresLitRepository(pool);

const createAdmission     = new CreateAdmission(admissionRepository, patientRepository, utilisateurRepository, litRepository);
const getAdmissionById    = new GetAdmissionById(admissionRepository);
const listAdmissions      = new ListAdmissions(admissionRepository);
const getAdmissionsEnCours = new GetAdmissionsEnCours(admissionRepository);
const assignLit           = new AssignLit(admissionRepository, litRepository);
const cloturerAdmission   = new CloturerAdmission(admissionRepository, patientRepository, litRepository);

const admissionController = new AdmissionController(
  createAdmission, getAdmissionById, listAdmissions,
  getAdmissionsEnCours, assignLit, cloturerAdmission
);

const router = Router();
router.use(authMiddleware);

router.get('/',
  permissionMiddleware('admissions.read'),
  admissionController.list
);

router.get('/en-cours',
  permissionMiddleware('admissions.read'),
  admissionController.getEnCours
);

router.get('/:id',
  permissionMiddleware('admissions.read'),
  admissionController.getById
);

router.post('/',
  roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
  permissionMiddleware('admissions.write'),
  validateRequest(createAdmissionSchema),
  admissionController.create
);

router.patch('/:id/assign-lit',
  roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
  permissionMiddleware('admissions.write'),
  validateRequest(assignLitSchema),
  admissionController.assignLit
);

router.patch('/:id/cloturer',
  roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR]),
  permissionMiddleware('admissions.write'),
  admissionController.cloturer
);

export default router;