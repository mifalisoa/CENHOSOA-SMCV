interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  patientId?: string;
}

// Stockage temporaire en mémoire
let notifications: Notification[] = [];

export function getNotificationsByDoctor(userRole: string): Notification[] {
  // Retourner les notifications non lues en premier
  return [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return a.read ? 1 : -1;
  });
}

export function getUnreadCount(userRole: string): number {
  return notifications.filter(n => !n.read).length;
}

export function markAsRead(notificationId: string): void {
  notifications = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
}

export function markAllAsRead(userRole: string): void {
  notifications = notifications.map(n => ({ ...n, read: true }));
}

export function deleteNotification(notificationId: string): void {
  notifications = notifications.filter(n => n.id !== notificationId);
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  notifications.push({
    ...notification,
    id: `notif-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    read: false
  });
}