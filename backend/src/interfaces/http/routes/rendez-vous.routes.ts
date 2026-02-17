import { Router } from 'express';
import { RendezVousController } from '../controllers/RendezVousController';
import { CreateRendezVous } from '../../../application/use-cases/rendez-vous/CreateRendezVous';
import { GetRendezVousByDocteur } from '../../../application/use-cases/rendez-vous/GetRendezVousByDocteur';
import { GetRendezVousByPatient } from '../../../application/use-cases/rendez-vous/GetRendezVousByPatient';
import { CancelRendezVous } from '../../../application/use-cases/rendez-vous/CancelRendezVous';
import { ConfirmRendezVous } from '../../../application/use-cases/rendez-vous/ConfirmRendezVous';
import { PostgresRendezVousRepository } from '../../../infrastructure/database/postgres/repositories/PostgresRendezVousRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { createRendezVousSchema, cancelRendezVousSchema } from '../validators/rendez-vous.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { ROLES } from '../../../config/constants';

// Dependency Injection
const rendezVousRepository = new PostgresRendezVousRepository(pool);
const patientRepository = new PostgresPatientRepository(pool);
const utilisateurRepository = new PostgresUtilisateurRepository(pool);

const createRendezVous = new CreateRendezVous(rendezVousRepository, patientRepository, utilisateurRepository);
const getRendezVousByDocteur = new GetRendezVousByDocteur(rendezVousRepository);
const getRendezVousByPatient = new GetRendezVousByPatient(rendezVousRepository);
const cancelRendezVous = new CancelRendezVous(rendezVousRepository);
const confirmRendezVous = new ConfirmRendezVous(rendezVousRepository);

const rendezVousController = new RendezVousController(
    createRendezVous,
    getRendezVousByDocteur,
    getRendezVousByPatient,
    cancelRendezVous,
    confirmRendezVous
);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route POST /api/rendez-vous
 * @desc Créer un rendez-vous
 * @access Private (docteur, secretaire, admin)
 */
router.post(
    '/',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
    validateRequest(createRendezVousSchema),
    rendezVousController.create
);

/**
 * @route GET /api/rendez-vous/docteur/:idDocteur
 * @desc Liste des RDV d'un docteur
 * @access Private
 */
router.get('/docteur/:idDocteur', rendezVousController.getByDocteur);

/**
 * @route GET /api/rendez-vous/patient/:idPatient
 * @desc Liste des RDV d'un patient
 * @access Private
 */
router.get('/patient/:idPatient', rendezVousController.getByPatient);

/**
 * @route PATCH /api/rendez-vous/:id/confirm
 * @desc Confirmer un rendez-vous
 * @access Private (docteur, secretaire, admin)
 */
router.patch(
    '/:id/confirm',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
    rendezVousController.confirm
);

/**
 * @route PATCH /api/rendez-vous/:id/cancel
 * @desc Annuler un rendez-vous
 * @access Private (docteur, secretaire, admin)
 */
router.patch(
    '/:id/cancel',
    roleMiddleware([ROLES.ADMIN, ROLES.DOCTEUR, ROLES.SECRETAIRE]),
    validateRequest(cancelRendezVousSchema),
    rendezVousController.cancel
);

export default router;