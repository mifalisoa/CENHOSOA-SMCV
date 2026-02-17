import { Router } from 'express';
import { SoinMedicalController } from '../controllers/SoinMedicalController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresSoinMedicalRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinMedicalRepository';

const router = Router();

const soinRepository = new PostgresSoinMedicalRepository(pool);
const soinController = new SoinMedicalController(soinRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/soins-medicaux
 * @desc    Créer un nouveau soin médical
 * @access  Médecins uniquement
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'admin']),
  soinController.create
);

/**
 * @route   GET /api/soins-medicaux/patient/:patientId
 * @desc    Récupérer tous les soins médicaux d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getByPatientId
);

/**
 * @route   GET /api/soins-medicaux/admission/:admissionId
 * @desc    Récupérer tous les soins médicaux d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getByAdmissionId
);

/**
 * @route   GET /api/soins-medicaux/:id
 * @desc    Récupérer un soin médical par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  soinController.getById
);

/**
 * @route   PUT /api/soins-medicaux/:id
 * @desc    Mettre à jour un soin médical
 * @access  Médecins uniquement
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  soinController.update
);

/**
 * @route   PATCH /api/soins-medicaux/:id/verify
 * @desc    Vérifier/Dévérifier un soin médical
 * @access  Médecins uniquement
 */
router.patch(
  '/:id/verify',
  roleMiddleware(['medecin', 'admin']),
  soinController.verify
);

/**
 * @route   DELETE /api/soins-medicaux/:id
 * @desc    Supprimer un soin médical
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  soinController.delete
);

export default router;