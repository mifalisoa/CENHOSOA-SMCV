// frontend/src/presentation/hooks/useNotifications.ts
// ✅ N'exporte QUE un hook → Fast Refresh OK

import { useContext } from 'react';
import { NotificationsContext } from '../context/NotificationsTypes';
import type { Notification, NotificationsContextValue } from '../context/NotificationsTypes';

export type { Notification, NotificationsContextValue };

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications doit être utilisé dans un <NotificationsProvider>');
  return ctx;
}