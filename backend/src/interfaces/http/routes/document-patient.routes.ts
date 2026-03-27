// backend/src/interfaces/http/routes/document-patient.routes.ts
//
// LEÇON : Le secrétaire a accès aux documents — c'est son seul accès
// aux données d'un dossier patient. Toutes les autres routes médicales
// lui sont bloquées.

import { Router } from 'express';
import { DocumentPatientController }           from '../controllers/DocumentPatientController';
import { authMiddleware }                       from '../middlewares/auth.middleware';
import { roleMiddleware }                       from '../middlewares/role.middleware';
import { pool }                                 from '../../../config/database';
import { PostgresDocumentPatientRepository }   from '../../../infrastructure/database/postgres/repositories/PostgresDocumentPatientRepository';

const router = Router();
const documentRepository = new PostgresDocumentPatientRepository(pool);
const documentController = new DocumentPatientController(documentRepository);

router.use(authMiddleware);

// Lecture + écriture — secrétaire inclus
const TOUS     = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier', 'secretaire'];
// Suppression — pas le secrétaire
const ECRITURE = ['admin', 'medecin', 'interne', 'infirmier'];

router.post(  '/',                       roleMiddleware(TOUS),     documentController.create);
router.get(   '/patient/:patientId',     roleMiddleware(TOUS),     documentController.getByPatientId);
router.get(   '/admission/:admissionId', roleMiddleware(TOUS),     documentController.getByAdmissionId);
router.get(   '/:id',                    roleMiddleware(TOUS),     documentController.getById);
router.put(   '/:id',                    roleMiddleware(TOUS),     documentController.update);
router.delete('/:id',                    roleMiddleware(ECRITURE), documentController.delete);

export default router;