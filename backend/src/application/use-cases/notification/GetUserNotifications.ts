import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';

export class GetUserNotifications {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(idUser: number, unreadOnly: boolean = false): Promise<Notification[]> {
        if (unreadOnly) {
            return this.notificationRepository.findUnreadByUser(idUser);
        }
        return this.notificationRepository.findByUser(idUser, true);
    }
}