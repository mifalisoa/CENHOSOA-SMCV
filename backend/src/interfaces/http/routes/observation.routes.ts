import { Router } from 'express';
import { ObservationController } from '../controllers/ObservationController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresObservationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';

const router = Router();

// Initialiser le repository et le controller
const observationRepository = new PostgresObservationRepository(pool);
const observationController = new ObservationController(observationRepository);

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route   POST /api/observations
 * @desc    Créer une nouvelle observation (externe ou hospitalisée)
 * @access  Médecins uniquement
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'admin']),
  observationController.create
);

/**
 * @route   GET /api/observations/patient/:patientId
 * @desc    Récupérer toutes les observations d'un patient
 * @query   ?type=externe|hospitalise (optionnel)
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  observationController.getByPatientId
);

/**
 * @route   GET /api/observations/admission/:admissionId
 * @desc    Récupérer toutes les observations d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  observationController.getByAdmissionId
);

/**
 * @route   GET /api/observations/:id
 * @desc    Récupérer une observation par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  observationController.getById
);

/**
 * @route   PUT /api/observations/:id
 * @desc    Mettre à jour une observation
 * @access  Médecins uniquement
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  observationController.update
);

/**
 * @route   DELETE /api/observations/:id
 * @desc    Supprimer une observation
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  observationController.delete
);

export default router;