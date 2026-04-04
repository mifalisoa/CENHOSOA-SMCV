// frontend/src/presentation/components/layout/SecretaryHeader.tsx

import { useState, useMemo, useRef }  from 'react';
import { Search, Calendar, ChevronRight, Bell, X, Menu } from 'lucide-react';
import { useAuth }                    from '../../hooks/useAuth';
import { usePatients }                from '../../hooks/usePatients';
import { Input }                      from '../common/Input';
import { Avatar, AvatarFallback }     from '../common/Avatar';
import { Badge }                      from '../common/Badge';
import { NotificationsDropdown }      from '../common/NotificationsDropdown';
import { useNotifications }           from '../../hooks/useNotifications';
import { useDebounce }                from '../../hooks/useDebounce';

interface SearchResult {
  category:    string;
  displayText: string;
  subtitle:    string;
  onClick:     () => void;
}

interface SecretaryHeaderProps {
  onViewChange:    (view: string) => void;
  toggleMobileMenu?: () => void;
}

interface PatientSearchable {
  nom_patient?:    string;
  prenom_patient?: string;
  num_dossier?:    string;
  statut_patient?: string;
}

export function SecretaryHeader({ onViewChange, toggleMobileMenu }: SecretaryHeaderProps) {
  const { user }        = useAuth();
  const { patients }    = usePatients();
  const { unreadCount } = useNotifications();

  const [searchTerm,        setSearchTerm]        = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch,  setShowMobileSearch]  = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const searchResults: SearchResult[] = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.trim().length < 1) return [];
    const terms = debouncedSearch.toLowerCase().trim();
    const results: SearchResult[] = [];

    (patients || []).forEach(patient => {
      const p      = patient as PatientSearchable;
      const nom    = p.nom_patient    || '';
      const prenom = p.prenom_patient || '';
      const numero = p.num_dossier    || '';
      const statut = p.statut_patient || 'externe';

      if (`${nom} ${prenom}`.toLowerCase().includes(terms) || numero.toLowerCase().includes(terms)) {
        results.push({
          category:    'Patient',
          displayText: `${nom} ${prenom}`,
          subtitle:    numero,
          onClick: () => {
            onViewChange(statut === 'externe' ? 'patients-externes' : 'patients-hospitalises');
            setSearchTerm('');
            setShowMobileSearch(false);
          },
        });
      }
    });
    return results;
  }, [debouncedSearch, patients, onViewChange]);

  const showSearchResults = searchResults.length > 0;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-20 relative">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">

        {/* Logo + menu mobile */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {toggleMobileMenu && (
            <button onClick={toggleMobileMenu} aria-label="Ouvrir le menu"
              className="p-2 hover:bg-gray-100 rounded-lg sm:hidden">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <img src="/logo.png" alt="CENHOSOA" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <div className="hidden sm:block">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">CENHOSOA</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Centre Hospitalier Soavinandriana</p>
            <p className="text-xs text-cyan-600 font-medium items-center gap-1 mt-0.5 hidden sm:flex">
              <Calendar className="w-3 h-3" />
              Gestion des Rendez-vous
            </p>
          </div>
        </div>

        {/* Recherche + notifications + profil */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Barre de recherche desktop */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="text" placeholder="Rechercher patients, RDV..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-72 lg:w-96 border-gray-200 focus:border-cyan-500 rounded-full bg-gray-50 focus:bg-white transition-all" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} aria-label="Effacer"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
                <div className="py-2">
                  {searchResults.map((result, i) => (
                    <button key={i} onClick={result.onClick}
                      className="w-full px-4 py-3 text-left hover:bg-cyan-50 border-b border-gray-100 last:border-0 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm truncate">{result.displayText}</span>
                            <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-none text-[10px] shrink-0">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{result.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bouton recherche mobile */}
          <button onClick={() => setShowMobileSearch(o => !o)} aria-label="Rechercher"
            className={`md:hidden p-2 rounded-xl transition-colors ${showMobileSearch ? 'bg-cyan-50 text-cyan-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button type="button" aria-label="Voir les notifications"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <NotificationsDropdown onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="flex items-center gap-2 sm:gap-3 bg-cyan-50 rounded-full pl-2 pr-2 sm:pr-4 py-1.5 border border-cyan-100">
            <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-cyan-200 shadow-sm">
              <AvatarFallback className="bg-cyan-600 text-white text-xs font-bold">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <h4 className="text-xs font-bold text-gray-900 leading-none">{user?.prenom} {user?.nom}</h4>
              <p className="text-[9px] text-cyan-600 font-bold uppercase mt-0.5 tracking-tighter">Secrétaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile — sous le header */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input ref={mobileInputRef} type="text" placeholder="Rechercher patients..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" />
            {searchTerm && (
              <button
                 onClick={() => { setSearchTerm(''); }}
                title="Effacer la recherche"
                aria-label="Effacer le contenu de la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSearchResults && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button key={i} onClick={result.onClick}
                  className="w-full px-4 py-3 text-left hover:bg-cyan-50 border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{result.displayText}</p>
                    <p className="text-xs text-gray-500">{result.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}