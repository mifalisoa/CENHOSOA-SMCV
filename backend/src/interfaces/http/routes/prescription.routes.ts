import { Router } from 'express';
import { PrescriptionController } from '../controllers/PrescriptionController';
import { CreatePrescription } from '../../../application/use-cases/prescription/CreatePrescription';
import { GetPrescriptionsByAdmission } from '../../../application/use-cases/prescription/GetPrescriptionsByAdmission';
import { UpdatePrescription } from '../../../application/use-cases/prescription/UpdatePrescription';
import { PostgresPrescriptionRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPrescriptionRepository';
import { PostgresAdmissionRepository } from '../../../infrastructure/database/postgres/repositories/PostgresAdmissionRepository';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../validators/prescription.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { ROLES } from '../../../config/constants';

// Dependency Injection
const prescriptionRepository = new PostgresPrescriptionRepository(pool);
const admissionRepository = new PostgresAdmissionRepository(pool);
const utilisateurRepository = new PostgresUtilisateurRepository(pool);

const createPrescription = new CreatePrescription(prescriptionRepository, admissionRepository, utilisateurRepository);
const getPrescriptionsByAdmission = new GetPrescriptionsByAdmission(prescriptionRepository);
const updatePrescription = new UpdatePrescription(prescriptionRepository);

const prescriptionController = new PrescriptionController(
    createPrescription,
    getPrescriptionsByAdmission,
    updatePrescription
);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route POST /api/prescriptions
 * @desc Créer une prescription
 * @access Private (docteur, admin)
 */
router.post(
    '/',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR]),
    validateRequest(createPrescriptionSchema),
    prescriptionController.create
);

/**
 * @route GET /api/prescriptions/admission/:idAdmission
 * @desc Liste des prescriptions d'une admission (avec filtre type optionnel)
 * @access Private
 */
router.get('/admission/:idAdmission', prescriptionController.getByAdmission);

/**
 * @route PATCH /api/prescriptions/:id
 * @desc Mettre à jour une prescription
 * @access Private (docteur, admin)
 */
router.patch(
    '/:id',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR]),
    validateRequest(updatePrescriptionSchema),
    prescriptionController.update
);

export default router;