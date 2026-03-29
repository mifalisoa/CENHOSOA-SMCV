// frontend/src/presentation/context/NotificationsTypes.ts
// ✅ Types et contexte uniquement — pas de composant, pas de hook

import { createContext } from 'react';

export interface Notification {
  id_notification:     number;
  id_destinataire:     number;
  date_creation_notif: string;
  titre_notif:         string;
  message_notif:       string;
  type_notif?:         'rdv' | 'admission' | 'urgence' | 'système' | 'info' | null;
  priorite?:           'basse' | 'normale' | 'haute' | 'critique' | null;
  urgence:             boolean;
  lien?:               string | null;
  lue:                 boolean;
  date_lecture?:       string | null;
}

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