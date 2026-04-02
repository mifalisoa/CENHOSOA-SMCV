// backend/src/interfaces/http/routes/utilisateur.routes.ts

import { Router }                 from 'express';
import { UtilisateursController } from '../controllers/UtilisateurController';
import { authMiddleware }          from '../middlewares/auth.middleware';
import { roleMiddleware }          from '../middlewares/role.middleware';
import { logAction }               from '../middlewares/action-logger.middleware';

const router     = Router();
const controller = new UtilisateursController();

router.use(authMiddleware);

// Lecture — pas de log
router.get('/',    (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));

// Écriture — loggée + réservée à l'admin
router.post(  '/',           roleMiddleware(['admin']), logAction('create', 'utilisateurs'), (req, res) => controller.create(req, res));
router.put(   '/:id',        roleMiddleware(['admin']), logAction('update', 'utilisateurs'), (req, res) => controller.update(req, res));
router.patch( '/:id/statut', roleMiddleware(['admin']), logAction('update', 'utilisateurs'), (req, res) => controller.changeStatut(req, res));
router.delete('/:id',        roleMiddleware(['admin']), logAction('delete', 'utilisateurs'), (req, res) => controller.delete(req, res));

export default router;