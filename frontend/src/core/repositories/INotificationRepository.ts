// frontend/src/core/repositories/INotificationRepository.ts
//
// Contrat limite aux endpoints HTTP. La partie temps reel (Socket.io) reste
// geree directement dans NotificationsContext.tsx : ce n'est pas le role
// d'un repository HTTP classique, et ca reste un risque qu'on ne touche pas
// dans ce module.

import type { Notification } from '../entities/Notification';

export interface NotificationsListResult {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface INotificationRepository {
  // GET /notifications
  // Le context actuel n'utilise que limit=30, sans filtre unreadOnly ni pagination
  // reelle (page toujours 1). Les params restent optionnels pour ne pas bloquer
  // un usage futur (ex: page dediee "toutes mes notifications" avec pagination).
  getAll(params?: { limit?: number; unreadOnly?: boolean; page?: number }): Promise<NotificationsListResult>;

  // GET /notifications/count
  // Pas utilise par NotificationsContext.tsx actuellement (qui deduit unreadCount
  // de la liste recuperee), mais expose car l'endpoint backend existe reellement.
  getUnreadCount(): Promise<number>;

  // PATCH /notifications/:id/lire
  markAsRead(id: number): Promise<void>;

  // PATCH /notifications/lire-tout
  markAllAsRead(): Promise<void>;

  // DELETE /notifications/:id
  delete(id: number): Promise<void>;

  // DELETE /notifications/lues
  deleteAllRead(): Promise<void>;
}