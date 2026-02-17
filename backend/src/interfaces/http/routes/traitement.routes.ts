import { Router } from 'express';
import { TraitementController } from '../controllers/TraitementController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresTraitementRepository } from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';

const router = Router();

const traitementRepository = new PostgresTraitementRepository(pool);
const traitementController = new TraitementController(traitementRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/traitements
 * @desc    Créer un nouveau traitement/ordonnance
 * @access  Médecins uniquement
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'admin']),
  traitementController.create
);

/**
 * @route   GET /api/traitements/patient/:patientId
 * @desc    Récupérer tous les traitements d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  traitementController.getByPatientId
);

/**
 * @route   GET /api/traitements/admission/:admissionId
 * @desc    Récupérer tous les traitements d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  traitementController.getByAdmissionId
);

/**
 * @route   GET /api/traitements/:id
 * @desc    Récupérer un traitement par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  traitementController.getById
);

/**
 * @route   PUT /api/traitements/:id
 * @desc    Mettre à jour un traitement
 * @access  Médecins uniquement
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  traitementController.update
);

/**
 * @route   DELETE /api/traitements/:id
 * @desc    Supprimer un traitement
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  traitementController.delete
);

export default router;