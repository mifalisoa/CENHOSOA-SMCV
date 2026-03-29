// frontend/src/presentation/components/layout/DoctorHeader.tsx

import { useState, useEffect }        from 'react';
import { useNavigate }                 from 'react-router-dom';
import { Search, Bell, Menu }          from 'lucide-react';
import { useAuth }                     from '../../hooks/useAuth';
import { usePatients }                 from '../../hooks/usePatients';
// ✅ Import depuis le Context, pas depuis le hook direct
import { useNotifications } from '../../hooks/useNotifications';
import { Input }                       from '../common/Input';
import { Avatar, AvatarFallback }      from '../common/Avatar';
import { Badge }                       from '../common/Badge';
import { NotificationsDropdown }       from '../common/NotificationsDropdown';
import { motion }                      from 'framer-motion';

interface DoctorHeaderProps {
  userRole:          'docteur' | 'interne' | 'stagiaire';
  toggleMobileMenu?: () => void;
}

export function DoctorHeader({ userRole, toggleMobileMenu }: DoctorHeaderProps) {
  const { user }     = useAuth();
  const { patients } = usePatients();
  const navigate     = useNavigate();

  const { unreadCount } = useNotifications();

  const [searchQuery,       setSearchQuery]       = useState('');
  const [searchResults,     setSearchResults]     = useState<
    { title: string; description: string; category: string; onClick: () => void }[]
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile,          setIsMobile]          = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery || searchQuery.trim().length < 1) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const terms   = searchQuery.toLowerCase().trim();
      const results: typeof searchResults = [];

      (patients || []).forEach((patient) => {
        const fullName   = `${patient.nom_patient} ${patient.prenom_patient}`.toLowerCase();
        const numDossier = (patient.num_dossier ?? '').toLowerCase();

        if (fullName.includes(terms) || numDossier.includes(terms)) {
          results.push({
            title:       `${patient.nom_patient} ${patient.prenom_patient}`,
            description: `Patient ${patient.statut_patient === 'externe' ? 'Externe' : 'Hospitalisé'} · ${patient.num_dossier ?? ''}`,
            category:    'Patient',
            onClick: () => {
              navigate('/doctor/patients-externes');
              setShowSearchResults(false);
              setSearchQuery('');
            },
          });
        }
      });

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, patients, navigate]);

  return (
    <header className="bg-white border-b border-gray-200 h-20 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-10">

        {/* Logo + menu mobile */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {isMobile && toggleMobileMenu && (
            <button onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              aria-label="Ouvrir le menu">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <img src="/logo.png" alt="CENHOSOA" className="w-16 h-16 lg:w-24 lg:h-24 object-contain" />
          {!isMobile && (
            <div className="hidden md:block">
              <h1 className="font-bold text-lg lg:text-xl text-gray-900 leading-tight">CENHOSOA</h1>
              <p className="text-[10px] lg:text-xs text-gray-500">Centre Hospitalier de Soavinandriana</p>
            </div>
          )}
        </div>

        {/* Recherche */}
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={isMobile ? 'Rechercher...' : 'Rechercher un patient...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 rounded-xl border-2 border-gray-100 focus:border-cyan-500 text-sm"
            />
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
            >
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <button key={index} onClick={result.onClick}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-left">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{result.title}</div>
                      <div className="text-xs text-gray-500">{result.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{result.category}</Badge>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">

          {/* Cloche notifications */}
          <button
            type="button"
            aria-label="Voir les notifications"
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 lg:p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profil */}
          <div className="flex items-center gap-2 lg:gap-3 bg-cyan-50 rounded-xl lg:rounded-2xl px-2 lg:px-4 py-1.5 border border-cyan-100">
            <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
              <AvatarFallback className="bg-cyan-600 text-white font-bold text-xs">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <div className="hidden xl:block text-left">
                <h4 className="text-xs lg:text-sm font-bold text-gray-900 truncate max-w-[120px]">
                  {user?.prenom} {user?.nom}
                </h4>
                <p className="text-[10px] text-cyan-600 font-medium capitalize">{userRole}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-50">
          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </header>
  );
}