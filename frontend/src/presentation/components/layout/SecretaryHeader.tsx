import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePatients } from '../../hooks/usePatients';
import { Input } from '../common/Input';
import { Avatar, AvatarFallback } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { SecretaryNotifications, useSecretaryNotifications } from '../notifications/SecretaryNotifications';

// Correction : Définition d'une interface pour les résultats de recherche
interface SearchResult {
  category: string;
  displayText: string;
  subtitle: string;
  onClick: () => void;
}

interface SecretaryHeaderProps {
  onViewChange: (view: string) => void;
}

export function SecretaryHeader({ onViewChange }: SecretaryHeaderProps) {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { notifications, markAsRead, markAllAsRead, dismiss } = useSecretaryNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Correction : Utilisation de useCallback pour éviter l'erreur de dépendance ESLint
  const performSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    // Simuler un délai de recherche
    const timeoutId = setTimeout(() => {
      const searchTerms = query.toLowerCase().trim();
      const results: SearchResult[] = [];

      // Recherche dans les patients
      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          // Note : Vérifiez si vos propriétés sont bien 'nom'/'prenoms' ou 'nom_patient'/'prenom_patient'
          // J'utilise ici un typage 'as any' temporaire ou le nom supposé pour corriger l'erreur de compilation
          const p = patient as any; 
          const nom = p.nom || p.nom_patient || "";
          const prenoms = p.prenoms || p.prenom_patient || "";
          const numero = p.numero || p.num_dossier || "";
          const age = p.age || "";
          const type = p.type || "externe";

          const fullName = `${nom} ${prenoms}`.toLowerCase();
          
          if (fullName.includes(searchTerms) || numero.toLowerCase().includes(searchTerms)) {
            results.push({
              category: 'Patient',
              displayText: `${nom} ${prenoms}`,
              subtitle: `${age} ans - ${numero}`,
              onClick: () => {
                onViewChange(type === 'externe' ? 'patients-externes' : 'patients-hospitalises');
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

    return () => clearTimeout(timeoutId);
  }, [patients, onViewChange]);

  // Debounce search
  useEffect(() => {
    if (searchTerm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      const cleanup = performSearch(searchTerm);
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchTerm, performSearch]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-20">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Logo et titre */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <img 
              src="/logo.png" 
              alt="CENHOSOA" 
              className="w-12 h-12 object-contain"
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
          <div className="relative max-w-xl search-container hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher patients, RDV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-96 border-gray-200 focus:border-emerald-500 rounded-full bg-gray-50 focus:bg-white transition-all"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      <span>Recherche...</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={result.onClick}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{result.displayText}</span>
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px]">
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
                )}
              </div>
            )}
          </div>

          <SecretaryNotifications
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
          />

          {/* Profil */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-full pl-2 pr-4 py-1.5 border border-emerald-100">
            <Avatar className="w-8 h-8 border border-emerald-200 shadow-sm">
              <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">
                {user?.prenom_user?.charAt(0)}{user?.nom_user?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <h4 className="text-xs font-bold text-gray-900 leading-none">
                {user?.prenom_user} {user?.nom_user}
              </h4>
              <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5 tracking-tighter">Secrétaire</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}