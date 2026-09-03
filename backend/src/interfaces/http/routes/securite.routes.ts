// backend/src/interfaces/http/routes/securite.routes.ts
//
// CHANGEMENT : routes /parametres et /ips retirees (voir SecuriteController.ts
// pour le detail du recentrage -- ces fonctionnalites n'apportaient pas de
// valeur reelle par rapport aux protections deja en place, et presentaient
// un risque si laissees modifiables via une UI web).

import { Router } from 'express';
import { SecuriteController } from '../controllers/SecuriteController';
import { authMiddleware }      from '../middlewares/auth.middleware';
import { roleMiddleware }      from '../middlewares/role.middleware';

const router     = Router();
const controller = new SecuriteController();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get(   '/stats',                (req, res) => controller.getStats(req, res));
router.get(   '/sessions',             (req, res) => controller.getSessions(req, res));
router.delete('/sessions/:sessionId',  (req, res) => controller.disconnectSession(req, res));
router.get(   '/alertes',              (req, res) => controller.getAlertes(req, res));
router.patch( '/alertes/:id',          (req, res) => controller.updateAlerte(req, res));
router.get(   '/logs',                 (req, res) => controller.getLogs(req, res));

export default router;