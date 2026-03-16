// backend/src/interfaces/http/routes/securite.routes.ts

import { Router } from 'express';
import { SecuriteController } from '../controllers/SecuriteController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();
const controller = new SecuriteController();

// Toutes les routes nécessitent authentification et rôle admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Stats et dashboard
router.get('/stats', (req, res) => controller.getStats(req, res));

// Sessions
router.get('/sessions', (req, res) => controller.getSessions(req, res));
router.delete('/sessions/:sessionId', (req, res) => controller.disconnectSession(req, res));

// Alertes
router.get('/alertes', (req, res) => controller.getAlertes(req, res));
router.patch('/alertes/:id', (req, res) => controller.updateAlerte(req, res));

// Logs
router.get('/logs', (req, res) => controller.getLogs(req, res));

// Paramètres
router.get('/parametres', (req, res) => controller.getParametres(req, res));
router.put('/parametres/:cle', (req, res) => controller.updateParametre(req, res));

// IPs bloquées
router.get('/ips', (req, res) => controller.getIPsBloquees(req, res));
router.post('/ips/bloquer', (req, res) => controller.bloquerIP(req, res));
router.delete('/ips/:id', (req, res) => controller.debloquerIP(req, res));

export default router;