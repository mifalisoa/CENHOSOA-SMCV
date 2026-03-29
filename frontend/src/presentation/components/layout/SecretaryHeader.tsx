// frontend/src/presentation/components/layout/SecretaryHeader.tsx

import { useState, useMemo }      from 'react';
import { Search, Calendar, ChevronRight, Bell } from 'lucide-react';
import { useAuth }                from '../../hooks/useAuth';
import { usePatients }            from '../../hooks/usePatients';
import { Input }                  from '../common/Input';
import { Avatar, AvatarFallback } from '../common/Avatar';
import { Badge }                  from '../common/Badge';
import { NotificationsDropdown }  from '../common/NotificationsDropdown';
import { useNotifications }       from '../../hooks/useNotifications';
import { useDebounce }            from '../../hooks/useDebounce';

interface SearchResult {
  category:    string;
  displayText: string;
  subtitle:    string;
  onClick:     () => void;
}

interface SecretaryHeaderProps {
  onViewChange: (view: string) => void;
}

interface PatientSearchable {
  nom_patient?:    string;
  prenom_patient?: string;
  num_dossier?:    string;
  statut_patient?: string;
}

export function SecretaryHeader({ onViewChange }: SecretaryHeaderProps) {
  const { user }        = useAuth();
  const { patients }    = usePatients();
  const { unreadCount } = useNotifications();

  const [searchTerm,        setSearchTerm]        = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Debounce sans useEffect — on retarde juste la valeur utilisée pour le calcul
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Résultats calculés avec useMemo — pas de setState, pas de useEffect
  const searchResults: SearchResult[] = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.trim().length < 1) return [];

    const terms   = debouncedSearch.toLowerCase().trim();
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
          },
        });
      }
    });

    return results;
  }, [debouncedSearch, patients, onViewChange]);

  const showSearchResults = searchResults.length > 0;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-20">
      <div className="flex items-center justify-between h-full px-6">

        {/* Logo */}
        <div className="flex items-center gap-5">
          <img src="/logo.png" alt="CENHOSOA" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">CENHOSOA</h2>
            <p className="text-xs text-gray-500">Centre Hospitalier Soavinandriana</p>
            <p className="text-xs text-cyan-600 font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              Gestion des Rendez-vous
            </p>
          </div>
        </div>

        {/* Recherche + notifications + profil */}
        <div className="flex items-center gap-4">

          {/* Barre de recherche */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher patients, RDV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-96 border-gray-200 focus:border-cyan-500 rounded-full bg-gray-50 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >×</button>
            )}

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={result.onClick}
                      className="w-full px-4 py-3 text-left hover:bg-cyan-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{result.displayText}</span>
                            <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-none text-[10px]">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{result.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cloche notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Voir les notifications"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white">
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
          <div className="flex items-center gap-3 bg-cyan-50 rounded-full pl-2 pr-4 py-1.5 border border-cyan-100">
            <Avatar className="w-8 h-8 border border-cyan-200 shadow-sm">
              <AvatarFallback className="bg-cyan-600 text-white text-xs font-bold">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <h4 className="text-xs font-bold text-gray-900 leading-none">
                {user?.prenom} {user?.nom}
              </h4>
              <p className="text-[9px] text-cyan-600 font-bold uppercase mt-0.5 tracking-tighter">Secrétaire</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}