import { useState, useEffect } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePatients } from '../../hooks/usePatients';
import { Input } from '../common/Input';
import { Avatar, AvatarFallback } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { SecretaryNotifications, useSecretaryNotifications } from '../notifications/SecretaryNotifications';

interface SecretaryHeaderProps {
  onViewChange: (view: string) => void;
}

export function SecretaryHeader({ onViewChange }: SecretaryHeaderProps) {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { notifications, markAsRead, markAllAsRead, dismiss } = useSecretaryNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fonction de recherche
  const performSearch = (query: string) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const searchTerms = query.toLowerCase().trim();
      const results: any[] = [];

      // Recherche dans les patients
      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          const fullName = `${patient.nom} ${patient.prenoms}`.toLowerCase();
          if (fullName.includes(searchTerms) || patient.numero.toLowerCase().includes(searchTerms)) {
            results.push({
              category: 'Patient',
              displayText: `${patient.nom} ${patient.prenoms}`,
              subtitle: `${patient.age} ans - ${patient.numero}`,
              onClick: () => {
                onViewChange(patient.type === 'externe' ? 'patients-externes' : 'patients-hospitalises');
                setShowSearchResults(false);
                setSearchTerm('');
              }
            });
          }
        });
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
      setIsSearching(false);
    }, 300);
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, patients]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-20">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Logo et titre mis à jour */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <img 
              src="/logo.png" 
              alt="CENHOSOA" 
              className="w-24 h-24 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">CENHOSOA</h2>
              <p className="text-xs text-gray-500">Centre Hospitalier Soavinandriana</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                Gestion des Rendez-vous
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche et profil */}
        <div className="flex items-center gap-4">
          {/* Barre de recherche */}
          <div className="relative max-w-xl search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher patients, RDV... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-96 search-input border-gray-200 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}

            {/* Résultats de recherche */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      Recherche en cours...
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={result.onClick}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{result.displayText}</span>
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                {result.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{result.subtitle}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Aucun résultat trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <SecretaryNotifications
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
          />

          {/* Profil */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-100">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold">
                {user?.prenom_user?.charAt(0)}{user?.nom_user?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <h4 className="text-sm font-semibold text-gray-900 leading-none">
                {user?.prenom_user} {user?.nom_user}
              </h4>
              <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-wider">Secrétaire</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}