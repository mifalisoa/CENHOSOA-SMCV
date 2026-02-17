import { Router } from 'express';
import { SoinInfirmierController } from '../controllers/SoinInfirmierController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresSoinInfirmierRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';

const router = Router();

const soinRepository = new PostgresSoinInfirmierRepository(pool);
const soinController = new SoinInfirmierController(soinRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/soins-infirmiers
 * @desc    Créer un nouveau soin infirmier
 * @access  Infirmiers et Médecins
 */
router.post(
  '/',
  roleMiddleware(['infirmier', 'medecin', 'admin']),
  soinController.create
);

/**
 * @route   GET /api/soins-infirmiers/patient/:patientId
 * @desc    Récupérer tous les soins infirmiers d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getByPatientId
);

/**
 * @route   GET /api/soins-infirmiers/admission/:admissionId
 * @desc    Récupérer tous les soins infirmiers d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getByAdmissionId
);

/**
 * @route   GET /api/soins-infirmiers/:id
 * @desc    Récupérer un soin infirmier par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getById
);

/**
 * @route   PUT /api/soins-infirmiers/:id
 * @desc    Mettre à jour un soin infirmier
 * @access  Infirmiers et Médecins
 */
router.put(
  '/:id',
  roleMiddleware(['infirmier', 'medecin', 'admin']),
  soinController.update
);

/**
 * @route   PATCH /api/soins-infirmiers/:id/verify
 * @desc    Vérifier/Dévérifier un soin infirmier
 * @access  Infirmiers et Médecins
 */
router.patch(
  '/:id/verify',
  roleMiddleware(['infirmier', 'medecin', 'admin']),
  soinController.verify
);

/**
 * @route   DELETE /api/soins-infirmiers/:id
 * @desc    Supprimer un soin infirmier
 * @access  Infirmiers, Médecins et Admin
 */
router.delete(
  '/:id',
  roleMiddleware(['infirmier', 'medecin', 'admin']),
  soinController.delete
);

export default router;