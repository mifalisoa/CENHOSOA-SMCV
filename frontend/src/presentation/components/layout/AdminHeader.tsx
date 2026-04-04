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

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchResult {
  type:       'patient' | 'utilisateur' | 'rendez_vous' | 'admission';
  id:         number;
  titre:      string;
  sous_titre: string;
  meta?:      string;
  url:        string;
}

// ── Config par type ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<SearchResult['type'], { icon: React.ElementType; label: string; color: string }> = {
  patient:     { icon: User,      label: 'Patient',     color: 'text-cyan-600 bg-cyan-50'    },
  utilisateur: { icon: Users,     label: 'Utilisateur', color: 'text-blue-600 bg-blue-50'    },
  rendez_vous: { icon: Calendar,  label: 'RDV',         color: 'text-orange-600 bg-orange-50' },
  admission:   { icon: BedDouble, label: 'Admission',   color: 'text-green-600 bg-green-50'  },
};

// ── Modal de recherche ────────────────────────────────────────────────────────

function SearchModal({ onClose }: { onClose: () => void }) {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);

  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  // Auto-focus à l'ouverture
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Fermer sur Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

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
    onClose();
  };

  // Grouper par type
  const groups = (['patient', 'utilisateur', 'rendez_vous', 'admission'] as const)
    .map(type => ({ type, items: results.filter(r => r.type === type) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col sm:items-start sm:justify-start sm:pt-20 sm:px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl sm:mx-auto bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-screen sm:max-h-[70vh]">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          {loading
            ? <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shrink-0" />
            : <Search className="w-5 h-5 text-gray-400 shrink-0" />
          }
          <input ref={inputRef} type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher patients, utilisateurs, RDV..."
            className="flex-1 text-sm sm:text-base outline-none text-gray-900 placeholder-gray-400 bg-transparent" />
          <button onClick={onClose} aria-label="Fermer"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Résultats */}
        <div className="flex-1 overflow-y-auto">

          {!searched && query.length < 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Tapez au moins 2 caractères</p>
              <p className="text-xs mt-1 text-gray-300">Patients · Utilisateurs · RDV · Admissions</p>
            </div>
          )}

          {searched && results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun résultat pour « {query} »</p>
            </div>
          )}

          {groups.map(({ type, items }) => {
            const config = TYPE_CONFIG[type];
            const Icon   = config.icon;
            return (
              <div key={type}>
                <div className="px-4 py-2 flex items-center gap-2 bg-gray-50/50">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.color}`}>
                    {config.label}s
                  </span>
                  <span className="text-xs text-gray-300">{items.length}</span>
                </div>
                {items.map(result => (
                  <button key={result.id} onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{result.titre}</p>
                      <p className="text-xs text-gray-500 truncate">{result.sous_titre}</p>
                    </div>
                    {result.meta && (
                      <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{result.meta}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">{results.length} résultat{results.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-300 hidden sm:block">Échap pour fermer</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AdminHeader ────────────────────────────────────────────────────────────────

export function AdminHeader() {
  const { user }        = useAuth();
  const { unreadCount } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch,        setShowSearch]        = useState(false);
  const [currentTime,       setCurrentTime]       = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ctrl+K pour ouvrir la recherche
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
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

            {/* Barre desktop — cliquable, ouvre modal */}
            <button onClick={() => setShowSearch(true)}
              className="relative hidden md:flex items-center gap-2 w-64 lg:w-80 h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-white transition-all text-left group">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors shrink-0" />
              <span className="flex-1 text-sm text-gray-400">Rechercher...</span>
              <span className="text-[10px] font-semibold text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded hidden lg:block">
                Ctrl+K
              </span>
            </button>

            <div className="flex items-center gap-2 sm:gap-4 border-l pl-2 sm:pl-6 border-gray-100">

              {/* Bouton recherche mobile */}
              <button type="button" aria-label="Ouvrir la recherche"
                onClick={() => setShowSearch(true)}
                className="md:hidden p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
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

        {showNotifications && (
          <div className="absolute right-2 sm:right-6 top-full mt-2 z-50">
            <NotificationsDropdown onClose={() => setShowNotifications(false)} />
          </div>
        )}
      </div>

      {/* Modal recherche globale */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}