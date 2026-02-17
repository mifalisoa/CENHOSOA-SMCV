import { Router } from 'express';
import { DocumentPatientController } from '../controllers/DocumentPatientController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { pool } from '../../../config/database';
import { PostgresDocumentPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresDocumentPatientRepository';

const router = Router();

const documentRepository = new PostgresDocumentPatientRepository(pool);
const documentController = new DocumentPatientController(documentRepository);

router.use(authMiddleware);

/**
 * @route   POST /api/documents-patients
 * @desc    Créer un nouveau document patient
 * @access  Médecins, Infirmiers, Admin
 */
router.post(
  '/',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  documentController.create
);

/**
 * @route   GET /api/documents-patients/patient/:patientId
 * @desc    Récupérer tous les documents d'un patient
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/patient/:patientId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  documentController.getByPatientId
);

/**
 * @route   GET /api/documents-patients/admission/:admissionId
 * @desc    Récupérer tous les documents d'une admission
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/admission/:admissionId',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  documentController.getByAdmissionId
);

/**
 * @route   GET /api/documents-patients/:id
 * @desc    Récupérer un document par son ID
 * @access  Médecins, Infirmiers, Admin
 */
router.get(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  documentController.getById
);

/**
 * @route   PUT /api/documents-patients/:id
 * @desc    Mettre à jour un document
 * @access  Médecins, Infirmiers, Admin
 */
router.put(
  '/:id',
  roleMiddleware(['medecin', 'infirmier', 'admin']),
  documentController.update
);

/**
 * @route   DELETE /api/documents-patients/:id
 * @desc    Supprimer un document
 * @access  Médecins et Admin uniquement
 */
router.delete(
  '/:id',
  roleMiddleware(['medecin', 'admin']),
  documentController.delete
);

export default router;