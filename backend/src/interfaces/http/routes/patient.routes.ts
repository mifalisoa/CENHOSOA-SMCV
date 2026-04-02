import { Router } from 'express';
import { PatientController }   from '../controllers/PatientController';
import { authMiddleware }       from '../middlewares/auth.middleware';
import { validateRequest }      from '../middlewares/validation.middleware';
import { logAction }            from '../middlewares/action-logger.middleware';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';

const router     = Router();
const controller = new PatientController();

router.use(authMiddleware);

// Lecture — pas de log
router.get('/stats',        (req, res, next) => controller.getStats(req, res, next));
router.get('/externes',     (req, res, next) => controller.getExternes(req, res, next));
router.get('/hospitalises', (req, res, next) => controller.getHospitalises(req, res, next));
router.get('/search',       (req, res, next) => controller.search(req, res, next));
router.get('/',             (req, res, next) => controller.getAll(req, res, next));
router.get('/:id',          (req, res, next) => controller.getById(req, res, next));

// Écriture — loggée
router.post(  '/',    validateRequest(createPatientSchema), logAction('create', 'patients'), (req, res, next) => controller.create(req, res, next));
router.put(   '/:id', validateRequest(updatePatientSchema), logAction('update', 'patients'), (req, res, next) => controller.update(req, res, next));
router.delete('/:id',                                        logAction('delete', 'patients'), (req, res, next) => controller.delete(req, res, next));

export default router;