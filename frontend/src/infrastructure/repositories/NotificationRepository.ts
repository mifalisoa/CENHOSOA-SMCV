// frontend/src/infrastructure/repositories/NotificationRepository.ts
//
// A la difference de LitRepository (reponses non wrappees), NotificationController
// utilise bien un format { success, data, ... } comme AdmissionController.
// Verifie ligne par ligne contre NotificationController.ts avant d'ecrire ce fichier :
//   getMyNotifications -> { success, data, pagination, unreadCount }
//   markAsRead / markAllAsRead / delete / deleteAllRead -> { success, message } (pas de data)
//   getUnreadCount -> { success, data: { count } }

import { httpClient } from '../http/axios.config';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';
import type { INotificationRepository, NotificationsListResult } from '../../core/repositories/INotificationRepository';

export class NotificationRepository implements INotificationRepository {
  async getAll(params?: { limit?: number; unreadOnly?: boolean; page?: number }): Promise<NotificationsListResult> {
    const response = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS, {
      params: {
        limit: params?.limit ?? 30,
        unreadOnly: params?.unreadOnly,
        page: params?.page,
      },
    });
    // Le controleur renvoie data, pagination et unreadCount comme 3 cles
    // au meme niveau (pas imbriquees dans data), contrairement a Admission.
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      unreadCount: response.data.unreadCount,
    };
  }

  async getUnreadCount(): Promise<number> {
    const response = await httpClient.get(API_ENDPOINTS.NOTIFICATIONS_COUNT);
    return response.data.data.count;
  }

  async markAsRead(id: number): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.NOTIFICATION_MARK_READ(id));
  }

  async markAllAsRead(): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.NOTIFICATION_BY_ID(id));
  }

  async deleteAllRead(): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL_READ);
  }
}

export const notificationRepository = new NotificationRepository();