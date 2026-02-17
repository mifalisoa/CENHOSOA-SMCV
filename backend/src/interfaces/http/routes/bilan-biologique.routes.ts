import { Router } from 'express';
import { BilanBiologiqueController } from '../controllers/BilanBiologiqueController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresBilanBiologiqueRepository } from '../../../infrastructure/database/postgres/repositories/PostgresBilanBiologiqueRepository';

const router = Router();

const bilanRepository = new PostgresBilanBiologiqueRepository(pool);
const bilanController = new BilanBiologiqueController(bilanRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/bilans-biologiques
 * @desc    Créer un nouveau bilan biologique
 * @access  Médecins uniquement
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'admin']),
  bilanController.create
);

/**
 * @route   GET /api/bilans-biologiques/patient/:patientId
 * @desc    Récupérer tous les bilans d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  bilanController.getByPatientId
);

/**
 * @route   GET /api/bilans-biologiques/admission/:admissionId
 * @desc    Récupérer tous les bilans d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  bilanController.getByAdmissionId
);

/**
 * @route   GET /api/bilans-biologiques/:id
 * @desc    Récupérer un bilan par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  bilanController.getById
);

/**
 * @route   PUT /api/bilans-biologiques/:id
 * @desc    Mettre à jour un bilan
 * @access  Médecins uniquement
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  bilanController.update
);

/**
 * @route   DELETE /api/bilans-biologiques/:id
 * @desc    Supprimer un bilan
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  bilanController.delete
);

export default router;