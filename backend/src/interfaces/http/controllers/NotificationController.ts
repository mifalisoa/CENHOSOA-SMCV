import { Response, NextFunction } from 'express';
import { CreateNotification } from '../../../application/use-cases/notification/CreateNotification';
import { GetUserNotifications } from '../../../application/use-cases/notification/GetUserNotifications';
import { MarkNotificationAsRead } from '../../../application/use-cases/notification/MarkNotificationAsRead';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificationController {
    constructor(
        private createNotification: CreateNotification,
        private getUserNotifications: GetUserNotifications,
        private markNotificationAsRead: MarkNotificationAsRead
    ) {}

    getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const unreadOnly = req.query.unreadOnly === 'true';
            const notifications = await this.getUserNotifications.execute(req.user!.id_user, unreadOnly);
            res.status(HTTP_STATUS.OK).json(successResponse(notifications));
        } catch (error) {
            next(error);
        }
    };

    markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await this.markNotificationAsRead.execute(id);
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Notification marquée comme lue')
            );
        } catch (error) {
            next(error);
        }
    };
}