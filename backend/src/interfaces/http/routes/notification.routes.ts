// backend/src/interfaces/http/routes/notification.routes.ts

import { Router }                 from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware }          from '../middlewares/auth.middleware';
import { logAction }               from '../middlewares/action-logger.middleware';

const router     = Router();
const controller = new NotificationController();

router.use(authMiddleware);

// Lecture — pas de log
router.get(   '/',          controller.getMyNotifications);
router.get(   '/count',     controller.getUnreadCount);

// Actions utilisateur légères — pas de log
router.patch( '/lire-tout', controller.markAllAsRead);
router.patch( '/:id/lire',  controller.markAsRead);

// Suppressions — loggées
router.delete('/lues',      logAction('delete', 'notifications'), controller.deleteAllRead);
router.delete('/:id',       logAction('delete', 'notifications'), controller.delete);

export default router;