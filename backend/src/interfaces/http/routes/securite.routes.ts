// backend/src/interfaces/http/routes/securite.routes.ts
// Les actions sécurité (updateParametre, disconnectSession) sont
// loggées directement dans SecuriteController — pas besoin de logAction ici.

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
router.get(   '/parametres',           (req, res) => controller.getParametres(req, res));
router.put(   '/parametres/:cle',      (req, res) => controller.updateParametre(req, res));
router.get(   '/ips',                  (req, res) => controller.getIPsBloquees(req, res));
router.post(  '/ips/bloquer',          (req, res) => controller.bloquerIP(req, res));
router.delete('/ips/:id',              (req, res) => controller.debloquerIP(req, res));

export default router;