// frontend/src/presentation/components/layout/AdminHeader.tsx

import { useState, useEffect }       from 'react';
import { Search, Bell }              from 'lucide-react';
import { useAuth }                   from '../../hooks/useAuth';
// ✅ Import depuis le Context, pas depuis le hook direct
import { useNotifications} from '../../hooks/useNotifications';
import { Input }                     from '../common/Input';
import { Avatar, AvatarFallback }    from '../common/Avatar';
import { NotificationsDropdown }     from '../common/NotificationsDropdown';
import { Logo }                      from '../common/Logo';

export function AdminHeader() {
  const { user }  = useAuth();
  const [searchQuery,       setSearchQuery]       = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime,       setCurrentTime]       = useState(new Date());

  const { unreadCount } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 relative">
      <div className="flex items-center justify-between gap-4">

        {/* Left — Logo + titre */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Logo size={48} variant="dark" className="hidden sm:block" />
          <Logo size={40} variant="dark" className="sm:hidden" />
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">CENHOSOA</h1>
            <p className="text-xs text-gray-500 hidden md:block">Centre Hospitalier de Soavinandriana</p>
            <p className="text-[10px] text-cyan-600 font-medium uppercase mt-0.5 hidden lg:block">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-6">

          {/* Barre de recherche desktop */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 border-l pl-3 sm:pl-6 border-gray-100">

            {/* Recherche mobile */}
            <button type="button" aria-label="Ouvrir la recherche"
              className="md:hidden p-2 hover:bg-cyan-50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Cloche notifications */}
            <button
              type="button"
              aria-label="Voir les notifications"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-2 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profil */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-bold text-gray-900 leading-none">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-[11px] text-cyan-600 mt-1 uppercase tracking-wider font-medium">
                  Administrateur
                </div>
              </div>
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-cyan-200">
                <AvatarFallback className="bg-cyan-600 text-white font-bold text-xs">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown notifications */}
      {showNotifications && (
        <div className="absolute right-4 sm:right-6 top-full mt-2 z-50">
          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </div>
  );
}