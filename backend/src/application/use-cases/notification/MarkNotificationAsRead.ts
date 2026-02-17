import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class MarkNotificationAsRead {
    constructor(private notificationRepository: INotificationRepository) {}

    async execute(id: number): Promise<void> {
        const notification = await this.notificationRepository.findById(id);
        if (!notification) {
            throw new NotFoundError('Notification');
        }

        await this.notificationRepository.markAsRead(id);
    }
}