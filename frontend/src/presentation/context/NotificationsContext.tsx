// frontend/src/presentation/context/NotificationsContext.tsx
// ✅ N'exporte QUE un composant → Fast Refresh OK

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth }    from '../hooks/useAuth';
import { httpClient } from '../../infrastructure/http/axios.config';
import { io, Socket } from 'socket.io-client';
import { NotificationsContext } from './NotificationsTypes';
import type { Notification }    from './NotificationsTypes';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    if (!user?.id_user) return;

    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await httpClient.get('/notifications?limit=30');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    const socket = io(SOCKET_URL, {
      auth:              { token },
      transports:        ['websocket', 'polling'],
      reconnection:      true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 [Notifications] Connecté à Socket.io');
      socket.emit('join', user.id_user);
    });

    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => {
        const existe = prev.some(n => n.id_notification === notif.id_notification);
        if (existe) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    socket.on('disconnect', () => {
      console.log('🔌 [Notifications] Déconnecté');
    });

    fetchNotifications();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id_user]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/notifications?limit=30');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Erreur refetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await httpClient.patch(`/notifications/${id}/lire`);
      setNotifications(prev =>
        prev.map(n => n.id_notification === id ? { ...n, lue: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await httpClient.patch('/notifications/lire-tout');
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur markAllAsRead:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await httpClient.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const notif = prev.find(n => n.id_notification === id);
        if (notif && !notif.lue) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.id_notification !== id);
      });
    } catch (err) {
      console.error('Erreur deleteNotification:', err);
    }
  }, []);

  const deleteAllRead = useCallback(async () => {
    try {
      await httpClient.delete('/notifications/lues');
      setNotifications(prev => prev.filter(n => !n.lue));
    } catch (err) {
      console.error('Erreur deleteAllRead:', err);
    }
  }, []);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,
      refetch,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}