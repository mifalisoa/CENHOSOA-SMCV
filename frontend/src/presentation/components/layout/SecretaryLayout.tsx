// frontend/src/presentation/components/layout/SecretaryLayout.tsx

import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SecretarySidebar }      from './SecretarySidebar';
import { SecretaryHeader }       from './SecretaryHeader';
import { LogoutConfirmModal }    from '../common/LogoutConfirmModal';
import { useMobileMenu }         from '../../hooks/useMobileMenu';
import { useLogout }             from '../../hooks/useLogout';
import { SidebarOverlay }        from '../common/SidebarOverlay';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { useSessionTimeout }     from '../../hooks/useSessionTimeout';
import { useAuth }               from '../../hooks/useAuth';
import { HelpButton }            from '../common/HelpButton';
import { toast }                 from 'sonner';

export function SecretaryLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { logout } = useAuth();
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { showLogoutModal, requestLogout, cancelLogout, confirmLogout, userName, userRole } = useLogout();

  const handleTimeout = useCallback(async () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    toast.error('Session expirée. Veuillez vous reconnecter.');
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  useSessionTimeout({ onTimeout: handleTimeout });

  // Dériver la vue courante depuis l'URL
  const getCurrentView = (): string => {
    if (location.pathname.includes('/patients-externes'))     return 'patients-externes';
    if (location.pathname.includes('/patients-hospitalises')) return 'patients-hospitalises';
    if (location.pathname.includes('/planning'))              return 'planning';
    if (location.pathname.includes('/patients/'))            return 'patients-externes'; // dossier
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const handleViewChange = (view: string) => {
    const routes: Record<string, string> = {
      'dashboard':             '/secretary',
      'planning':              '/secretary/planning',
      'patients-externes':     '/secretary/patients-externes',
      'patients-hospitalises': '/secretary/patients-hospitalises',
    };
    navigate(routes[view] || '/secretary');
    closeMobileMenu();
  };

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">

        <SidebarOverlay isOpen={isMobileMenuOpen} onClose={closeMobileMenu} isMobile={isMobile} />

        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 h-20">
          <SecretaryHeader
            onViewChange={handleViewChange}
            toggleMobileMenu={isMobile ? toggleMobileMenu : undefined}
          />
        </div>

        {/* Sidebar */}
        <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 z-40 overflow-y-auto transition-all duration-300 ${
          isMobile
            ? `w-70 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
            : isSidebarCollapsed ? 'w-20' : 'w-70'
        }`}>
          <SecretarySidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            isMobile={isMobile}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={requestLogout}
          />
        </div>

        {/* Contenu — Outlet remplace children */}
        <div className={`pt-20 transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-70'
        }`}>
          <main className={isMobile ? 'p-4' : 'p-10'}>
            <Outlet />
          </main>
        </div>

        <HelpButton />

        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
          userName={userName}
          userRole={userRole}
        />
      </div>
    </NotificationsProvider>
  );
}