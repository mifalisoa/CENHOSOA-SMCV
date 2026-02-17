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
import { ROLES } from '../../../config/constants';

// Dependency Injection
const admissionRepository = new PostgresAdmissionRepository(pool);
const patientRepository = new PostgresPatientRepository(pool);
const utilisateurRepository = new PostgresUtilisateurRepository(pool);
const litRepository = new PostgresLitRepository(pool);

const createAdmission = new CreateAdmission(admissionRepository, patientRepository, utilisateurRepository, litRepository);
const getAdmissionById = new GetAdmissionById(admissionRepository);
const listAdmissions = new ListAdmissions(admissionRepository);
const getAdmissionsEnCours = new GetAdmissionsEnCours(admissionRepository);
const assignLit = new AssignLit(admissionRepository, litRepository);
const cloturerAdmission = new CloturerAdmission(admissionRepository, patientRepository, litRepository);

const admissionController = new AdmissionController(
    createAdmission,
    getAdmissionById,
    listAdmissions,
    getAdmissionsEnCours,
    assignLit,
    cloturerAdmission
);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/admissions
 * @desc Liste de toutes les admissions (avec pagination)
 * @access Private
 */
router.get('/', admissionController.list);

/**
 * @route GET /api/admissions/en-cours
 * @desc Liste des admissions en cours
 * @access Private
 */
router.get('/en-cours', admissionController.getEnCours);

/**
 * @route GET /api/admissions/:id
 * @desc Détails d'une admission
 * @access Private
 */
router.get('/:id', admissionController.getById);

/**
 * @route POST /api/admissions
 * @desc Créer une admission
 * @access Private (docteur, secretaire, admin)
 */
router.post(
    '/',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
    validateRequest(createAdmissionSchema),
    admissionController.create
);

/**
 * @route PATCH /api/admissions/:id/assign-lit
 * @desc Assigner un lit à une admission
 * @access Private (docteur, secretaire, admin)
 */
router.patch(
    '/:id/assign-lit',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
    validateRequest(assignLitSchema),
    admissionController.assignLit
);

/**
 * @route PATCH /api/admissions/:id/cloturer
 * @desc Clôturer une admission (sortie)
 * @access Private (docteur, admin)
 */
router.patch(
    '/:id/cloturer',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR]),
    admissionController.cloturer
);

export default router;