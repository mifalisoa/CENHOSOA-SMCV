// frontend/src/presentation/context/NotificationsTypes.ts
// Types et contexte uniquement — pas de composant, pas de hook

import { createContext } from 'react';
// Notification est maintenant defini une seule fois dans core/entities/Notification.ts.
// On le re-exporte ici pour ne rien casser des imports existants
// (useNotifications.ts, NotificationsContext.tsx importent depuis ce fichier).
export type { Notification } from '../../core/entities/Notification';
import type { Notification } from '../../core/entities/Notification';

export interface NotificationsContextValue {
  notifications:      Notification[];
  unreadCount:        number;
  loading:            boolean;
  markAsRead:         (id: number) => Promise<void>;
  markAllAsRead:      () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllRead:      () => Promise<void>;
  refetch:            () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);