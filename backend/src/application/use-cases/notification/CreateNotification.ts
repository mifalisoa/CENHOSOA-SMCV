import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { CreateNotificationDTO, Notification } from '../../../domain/entities/Notification';

export class CreateNotification {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(data: CreateNotificationDTO): Promise<Notification> {
        return this.notificationRepository.create(data);
    }
}