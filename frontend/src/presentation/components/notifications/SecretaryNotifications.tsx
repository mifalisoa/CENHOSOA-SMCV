// frontend/src/presentation/components/notifications/SecretaryNotifications.tsx

import { useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecretaryNotification } from '../../hooks/useSecretaryNotifications';

interface SecretaryNotificationsProps {
  notifications:   SecretaryNotification[];
  onMarkAsRead:    (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss:       (id: string) => void;
}

export function SecretaryNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: SecretaryNotificationsProps) {
  const [open, setOpen] = useState(false);
  const unreadCount     = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: -8, scale: 0.97  }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" />Tout lire
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors ${
                      !notif.read ? 'bg-cyan-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    {!notif.read && <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{notif.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{notif.heure}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.read && (
                        <button onClick={() => onMarkAsRead(notif.id)} title="Marquer comme lu"
                          className="p-1 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => onDismiss(notif.id)} title="Supprimer"
                        className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}