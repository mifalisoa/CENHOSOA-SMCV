// frontend/src/presentation/context/NotificationsContext.tsx
//
// CHANGEMENTS PAR RAPPORT A LA VERSION PRECEDENTE :
// 1. Les 5 appels HTTP (fetch, markAsRead, markAllAsRead, delete, deleteAllRead)
//    passent maintenant par notificationRepository au lieu de httpClient en dur.
// 2. fetchNotifications (dans le useEffect) et refetch etaient un copier-coller
//    exact l'un de l'autre : consolides en une seule fonction refetch, appelee
//    aussi au montage. Comportement inchangé, plus de duplication.
// 3. AUCUN changement sur la partie Socket.io (connexion, reconnexion, event
//    'notification', son via useNotificationSound) : c'est la partie a risque
//    de ce module, on n'y touche pas dans ce refactor.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth }    from '../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { NotificationsContext } from './NotificationsTypes';
import type { Notification }    from './NotificationsTypes';
import { useNotificationSound } from '../hooks/useNotificationSound';
import { notificationRepository } from '../../infrastructure/repositories/NotificationRepository';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user }  = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const { play }  = useNotificationSound();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  // Chargement (initial ET manuel) : une seule version, plus de duplication
  // avec l'ancien fetchNotifications qui faisait exactement la meme chose.
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationRepository.getAll({ limit: 30 });
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id_user) return;

    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';

    const socket = io(SOCKET_URL, {
      auth:              { token },
      transports:        ['websocket', 'polling'],
      reconnection:      true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Notifications : connecte a Socket.io');
      socket.emit('join', user.id_user);
    });

    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => {
        const existe = prev.some(n => n.id_notification === notif.id_notification);
        if (existe) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(prev => prev + 1);

      // Son a chaque nouvelle notification temps reel
      play();
    });

    socket.on('disconnect', () => {
      console.log('Notifications : deconnecte');
    });

    refetch();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id_user, play, refetch]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationRepository.markAsRead(id);
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
      await notificationRepository.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur markAllAsRead:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationRepository.delete(id);
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
      await notificationRepository.deleteAllRead();
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