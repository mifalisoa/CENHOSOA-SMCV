// frontend/src/presentation/components/common/NotificationsDropdown.tsx

import { useRef, useEffect } from 'react';
import { useNavigate }       from 'react-router-dom';
import {
  Bell, X, Check, CheckCheck, Trash2,
  Calendar, Stethoscope, AlertTriangle, Info, Settings,
} from 'lucide-react';
import { useNotifications, type Notification } from '../../hooks/useNotifications';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s    = Math.floor(diff / 1000);
  if (s < 60)        return 'À l\'instant';
  if (s < 3600)      return `Il y a ${Math.floor(s / 60)} min`;
  if (s < 86400)     return `Il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) return `Il y a ${Math.floor(s / 86400)} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function getTypeIcon(type: Notification['type_notif']) {
  switch (type) {
    case 'rdv':       return <Calendar      className="w-4 h-4" />;
    case 'admission': return <Stethoscope   className="w-4 h-4" />;
    case 'urgence':   return <AlertTriangle className="w-4 h-4" />;
    case 'système':   return <Settings      className="w-4 h-4" />;
    default:          return <Info          className="w-4 h-4" />;
  }
}

function getTypeColors(type: Notification['type_notif'], priorite: Notification['priorite']) {
  if (priorite === 'critique' || priorite === 'haute') {
    return { bg: 'bg-red-100',   icon: 'text-red-600',   dot: 'bg-red-500'   };
  }
  switch (type) {
    case 'rdv':       return { bg: 'bg-blue-100',  icon: 'text-blue-600',  dot: 'bg-blue-500'  };
    case 'admission': return { bg: 'bg-cyan-100',  icon: 'text-cyan-600',  dot: 'bg-cyan-500'  };
    case 'urgence':   return { bg: 'bg-red-100',   icon: 'text-red-600',   dot: 'bg-red-500'   };
    case 'système':   return { bg: 'bg-gray-100',  icon: 'text-gray-600',  dot: 'bg-gray-500'  };
    default:          return { bg: 'bg-green-100', icon: 'text-green-600', dot: 'bg-green-500' };
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface NotificationsDropdownProps { onClose: () => void; }

// ── Composant principal ───────────────────────────────────────────────────────

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead, deleteNotification, deleteAllRead,
  } = useNotifications();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.lue) await markAsRead(notif.id_notification);
    if (notif.lien) { navigate(notif.lien); onClose(); }
  };

  const unread = notifications.filter(n => !n.lue);
  const read   = notifications.filter(n =>  n.lue);

  return (
    /*
     * Sur mobile : pleine largeur, ancré à droite avec marge
     * Sur desktop : largeur fixe 380px
     * max-h adaptatif : plus court sur mobile pour ne pas couvrir tout l'écran
     */
    <div
      ref={panelRef}
      className="w-[calc(100vw-2rem)] sm:w-[380px] max-h-[70vh] sm:max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} title="Tout marquer comme lu" aria-label="Tout marquer comme lu"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-cyan-600">
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {read.length > 0 && (
            <button onClick={deleteAllRead} title="Supprimer les lues" aria-label="Supprimer les notifications lues"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} title="Fermer" aria-label="Fermer"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">Aucune notification</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 sm:px-5 py-2.5">
                  Nouvelles — {unread.length}
                </p>
                {unread.map(notif => (
                  <NotifItem key={notif.id_notification} notif={notif}
                    onClick={() => handleNotifClick(notif)}
                    onDelete={() => deleteNotification(notif.id_notification)}
                    onMark={() => markAsRead(notif.id_notification)} />
                ))}
              </div>
            )}
            {read.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 sm:px-5 py-2.5 border-t border-gray-50">
                  Déjà lues — {read.length}
                </p>
                {read.map(notif => (
                  <NotifItem key={notif.id_notification} notif={notif}
                    onClick={() => handleNotifClick(notif)}
                    onDelete={() => deleteNotification(notif.id_notification)}
                    onMark={() => markAsRead(notif.id_notification)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Item individuel ───────────────────────────────────────────────────────────

interface NotifItemProps {
  notif:    Notification;
  onClick:  () => void;
  onDelete: () => void;
  onMark:   () => void;
}

function NotifItem({ notif, onClick, onDelete, onMark }: NotifItemProps) {
  const colors = getTypeColors(notif.type_notif, notif.priorite);

  return (
    <div onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notif.lue ? 'bg-cyan-50/40' : ''
      }`}>
      {!notif.lue && (
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      )}

      <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full ${colors.bg} ${colors.icon} flex items-center justify-center mt-0.5`}>
        {getTypeIcon(notif.type_notif)}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm leading-snug ${!notif.lue ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
          {notif.titre_notif}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message_notif}
        </p>
        <p className={`text-[10px] sm:text-[11px] mt-1 font-medium ${!notif.lue ? 'text-cyan-600' : 'text-gray-400'}`}>
          {timeAgo(notif.date_creation_notif)}
        </p>
      </div>

      {/* Actions — toujours visibles sur mobile (pas de hover) */}
      <div className="shrink-0 flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {!notif.lue && (
          <button onClick={(e) => { e.stopPropagation(); onMark(); }}
            title="Marquer comme lu" aria-label="Marquer comme lu"
            className="p-1 hover:bg-cyan-100 rounded text-gray-400 hover:text-cyan-600 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Supprimer" aria-label="Supprimer"
          className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}