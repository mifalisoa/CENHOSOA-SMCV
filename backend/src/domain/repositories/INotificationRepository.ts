import { Notification, CreateNotificationDTO } from '../entities/Notification';

export interface INotificationRepository {
    create(data: CreateNotificationDTO): Promise<Notification>;
    findById(id: number): Promise<Notification | null>;
    findByUser(idUser: number, luesIncluses?: boolean): Promise<Notification[]>;
    findUnreadByUser(idUser: number): Promise<Notification[]>;
    markAsRead(id: number): Promise<boolean>;
    markAllAsRead(idUser: number): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}