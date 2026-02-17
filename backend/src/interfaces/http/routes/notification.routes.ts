import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { CreateNotification } from '../../../application/use-cases/notification/CreateNotification';
import { GetUserNotifications } from '../../../application/use-cases/notification/GetUserNotifications';
import { MarkNotificationAsRead } from '../../../application/use-cases/notification/MarkNotificationAsRead';
import { PostgresNotificationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresNotificationRepository';
import { pool } from '../../../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';

// Dependency Injection
const notificationRepository = new PostgresNotificationRepository(pool);
const createNotification = new CreateNotification(notificationRepository);
const getUserNotifications = new GetUserNotifications(notificationRepository);
const markNotificationAsRead = new MarkNotificationAsRead(notificationRepository);

const notificationController = new NotificationController(
    createNotification,
    getUserNotifications,
    markNotificationAsRead
);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/notifications
 * @desc Mes notifications (avec filtre unreadOnly optionnel)
 * @access Private
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Marquer une notification comme lue
 * @access Private
 */
router.patch('/:id/read', notificationController.markAsRead);

export default router;