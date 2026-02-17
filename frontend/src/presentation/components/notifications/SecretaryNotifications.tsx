import { Bell } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  titre: string;
  message: string;
  heure: string;
  read: boolean;
}

interface SecretaryNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function SecretaryNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss
}: SecretaryNotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button className="relative p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

export function useSecretaryNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    dismiss
  };
}