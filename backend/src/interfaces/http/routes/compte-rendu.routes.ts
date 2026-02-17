import { Router } from 'express';
import { CompteRenduController } from '../controllers/CompteRenduController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresCompteRenduRepository } from '../../../infrastructure/database/postgres/repositories/PostgresCompteRenduRepository';

const router = Router();

const compteRenduRepository = new PostgresCompteRenduRepository(pool);
const compteRenduController = new CompteRenduController(compteRenduRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/comptes-rendus
 * @desc    Créer un nouveau compte rendu d'hospitalisation
 * @access  Médecins uniquement
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'admin']),
  compteRenduController.create
);

/**
 * @route   GET /api/comptes-rendus/patient/:patientId
 * @desc    Récupérer tous les comptes rendus d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  compteRenduController.getByPatientId
);

/**
 * @route   GET /api/comptes-rendus/admission/:admissionId
 * @desc    Récupérer le compte rendu d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  compteRenduController.getByAdmissionId
);

/**
 * @route   GET /api/comptes-rendus/:id
 * @desc    Récupérer un compte rendu par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  compteRenduController.getById
);

/**
 * @route   PUT /api/comptes-rendus/:id
 * @desc    Mettre à jour un compte rendu
 * @access  Médecins uniquement
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  compteRenduController.update
);

/**
 * @route   DELETE /api/comptes-rendus/:id
 * @desc    Supprimer un compte rendu
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  compteRenduController.delete
);

export default router;