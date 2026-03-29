// backend/src/interfaces/http/routes/notification.routes.ts

import { Router }                  from 'express';
import { NotificationController }  from '../controllers/NotificationController';
import { authMiddleware }           from '../middlewares/auth.middleware';

const router     = Router();
const controller = new NotificationController();

router.use(authMiddleware);

router.get(   '/',           controller.getMyNotifications);
router.get(   '/count',      controller.getUnreadCount);
router.patch( '/lire-tout',  controller.markAllAsRead);
router.delete('/lues',       controller.deleteAllRead);
router.patch( '/:id/lire',   controller.markAsRead);
router.delete('/:id',        controller.delete);

export default router;