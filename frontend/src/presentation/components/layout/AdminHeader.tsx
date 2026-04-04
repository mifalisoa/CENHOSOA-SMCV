// frontend/src/presentation/components/layout/AdminHeader.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate }             from 'react-router-dom';
import { Search, Bell, X, User, Calendar, BedDouble, Users } from 'lucide-react';
import { useAuth }                 from '../../hooks/useAuth';
import { useNotifications }        from '../../hooks/useNotifications';
import { Avatar, AvatarFallback }  from '../common/Avatar';
import { NotificationsDropdown }   from '../common/NotificationsDropdown';
import { Logo }                    from '../common/Logo';
import { httpClient }              from '../../../infrastructure/http/axios.config';
import { useDebounce }             from '../../hooks/useDebounce';

interface SearchResult {
  type:       'patient' | 'utilisateur' | 'rendez_vous' | 'admission';
  id:         number;
  titre:      string;
  sous_titre: string;
  meta?:      string;
  url:        string;
}

const TYPE_CONFIG: Record<SearchResult['type'], { icon: React.ElementType; label: string; color: string }> = {
  patient:     { icon: User,      label: 'Patient',     color: 'text-cyan-600 bg-cyan-50'     },
  utilisateur: { icon: Users,     label: 'Utilisateur', color: 'text-blue-600 bg-blue-50'     },
  rendez_vous: { icon: Calendar,  label: 'RDV',         color: 'text-orange-600 bg-orange-50' },
  admission:   { icon: BedDouble, label: 'Admission',   color: 'text-green-600 bg-green-50'   },
};

export function AdminHeader() {
  const { user }        = useAuth();
  const { unreadCount } = useNotifications();
  const navigate        = useNavigate();
  const searchRef       = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);

  const [query,             setQuery]             = useState('');
  const [results,           setResults]           = useState<SearchResult[]>([]);
  const [loading,           setLoading]           = useState(false);
  const [showDropdown,      setShowDropdown]      = useState(false);
  const [searched,          setSearched]          = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch,  setShowMobileSearch]  = useState(false);
  const [currentTime,       setCurrentTime]       = useState(new Date());

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Ctrl+K pour focus la barre
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    try {
      setLoading(true);
      const res = await httpClient.get('/search', { params: { q } });
      setResults(res.data.data ?? []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debouncedQuery); }, [debouncedQuery, doSearch]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setShowDropdown(false);
    setQuery('');
  };

  const groups = (['patient', 'utilisateur', 'rendez_vous', 'admission'] as const)
    .map(type => ({ type, items: results.filter(r => r.type === type) }))
    .filter(g => g.items.length > 0);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 relative">
      <div className="flex items-center justify-between gap-4">

        {/* Left */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Logo size={48} variant="dark" className="hidden sm:block" />
          <Logo size={36} variant="dark" className="sm:hidden" />
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">CENHOSOA</h1>
            <p className="text-xs text-gray-500 hidden md:block">Centre Hospitalier de Soavinandriana</p>
            <p className="text-[10px] text-cyan-600 font-medium uppercase mt-0.5 hidden lg:block">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-6">

          {/* Barre de recherche desktop — dropdown inline */}
          <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher... (Ctrl+K)"
              className="w-full pl-9 pr-8 h-10 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm transition-all"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
                title="Effacer la recherche"
                aria-label="Vider le champ de recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown résultats */}
            {showDropdown && (query.length >= 2) && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">

                {loading && (
                  <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    Recherche...
                  </div>
                )}

                {!loading && searched && results.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    Aucun résultat pour « {query} »
                  </div>
                )}

                {!loading && groups.map(({ type, items }) => {
                  const config = TYPE_CONFIG[type];
                  const Icon   = config.icon;
                  return (
                    <div key={type}>
                      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.label}s
                        </span>
                        <span className="text-xs text-gray-300">{items.length}</span>
                      </div>
                      {items.map(result => (
                        <button key={result.id} onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{result.titre}</p>
                            <p className="text-xs text-gray-500 truncate">{result.sous_titre}</p>
                          </div>
                          {result.meta && (
                            <span className="text-xs text-gray-400 shrink-0">{result.meta}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}

                {!loading && results.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-400">{results.length} résultat{results.length > 1 ? 's' : ''} · Échap pour fermer</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 border-l pl-2 sm:pl-6 border-gray-100">

            {/* Recherche mobile */}
            <button type="button" aria-label="Ouvrir la recherche"
              onClick={() => setShowMobileSearch(o => !o)}
              className={`md:hidden p-2 rounded-lg transition-colors ${showMobileSearch ? 'bg-cyan-50 text-cyan-600' : 'hover:bg-cyan-50 text-gray-600'}`}>
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button type="button" aria-label="Voir les notifications"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-2 hover:bg-cyan-50 rounded-lg transition-colors">
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
                <div className="text-sm font-bold text-gray-900 leading-none">{user?.prenom} {user?.nom}</div>
                <div className="text-[11px] text-cyan-600 mt-1 uppercase tracking-wider font-medium">Administrateur</div>
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

      {/* Recherche mobile — barre sous le header */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
            <input type="text" placeholder="Rechercher..."
              value={query} onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm" />
            {query && (
              <button 
                onClick={() => { setQuery(''); setResults([]); }}
                title="Effacer la recherche"
                aria-label="Effacer le contenu de la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Résultats mobile */}
          {query.length >= 2 && (loading || results.length > 0 || searched) && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  Recherche...
                </div>
              )}
              {!loading && searched && results.length === 0 && (
                <p className="px-4 py-4 text-center text-sm text-gray-400">Aucun résultat</p>
              )}
              {!loading && groups.map(({ type, items }) => {
                const config = TYPE_CONFIG[type];
                const Icon   = config.icon;
                return (
                  <div key={type}>
                    <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}s
                      </span>
                    </div>
                    {items.map(result => (
                      <button key={result.id} onClick={() => { handleResultClick(result); setShowMobileSearch(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{result.titre}</p>
                          <p className="text-xs text-gray-500 truncate">{result.sous_titre}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-2 sm:right-6 top-full mt-2 z-50">
          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </div>
  );
}