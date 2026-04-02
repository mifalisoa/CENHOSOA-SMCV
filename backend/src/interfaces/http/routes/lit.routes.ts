import { Router } from 'express';
import { pool }        from '../../../config/database';
import { LitService }  from '../../../application/services/LitService';
import { LitController } from '../controllers/LitController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logAction }      from '../middlewares/action-logger.middleware';

const router = Router();
const litService    = new LitService(pool);
const litController = new LitController(litService);

router.use(authMiddleware);

// Lecture — pas de log
router.get('/',               litController.getAllLits);
router.get('/statistiques',   litController.getStatistiques);
router.get('/:id',            litController.getLitById);

// Écriture — loggée
router.post('/initialiser',   logAction('create', 'lits'), litController.initialiserLits);
router.post('/',               logAction('create', 'lits'), litController.createLit);
router.put('/:id',             logAction('update', 'lits'), litController.updateLit);
router.delete('/:id',          logAction('delete', 'lits'), litController.deleteLit);
router.post('/:id/liberer',    logAction('update', 'lits'), litController.libererLit);

export default router;