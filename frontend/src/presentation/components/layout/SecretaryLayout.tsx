// frontend/src/presentation/components/layout/SecretaryLayout.tsx

import { useState, useCallback }  from 'react';
import { useNavigate }            from 'react-router-dom';
import type { ReactNode }         from 'react';
import { SecretarySidebar }       from './SecretarySidebar';
import { SecretaryHeader }        from './SecretaryHeader';
import { LogoutConfirmModal }     from '../common/LogoutConfirmModal';
import { useMobileMenu }          from '../../hooks/useMobileMenu';
import { useLogout }              from '../../hooks/useLogout';
import { SidebarOverlay }         from '../common/SidebarOverlay';
import { NotificationsProvider }  from '../../context/NotificationsContext';
import { useSessionTimeout }      from '../../hooks/useSessionTimeout';
import { useAuth }                from '../../hooks/useAuth';
import { toast }                  from 'sonner';

interface SecretaryLayoutProps {
  children:     ReactNode;
  currentView:  string;
  onViewChange: (view: string) => void;
  onLogout:     () => void;
}

export function SecretaryLayout({ children, currentView, onViewChange }: SecretaryLayoutProps) {
  const navigate               = useNavigate();
  const { logout }             = useAuth();
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { showLogoutModal, requestLogout, cancelLogout, confirmLogout, userName, userRole } = useLogout();

  const handleTimeout = useCallback(async () => {
    toast.error('Session expirée. Veuillez vous reconnecter.');
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  useSessionTimeout({ onTimeout: handleTimeout });

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">

        <SidebarOverlay isOpen={isMobileMenuOpen} onClose={closeMobileMenu} isMobile={isMobile} />

        {/* Header — avec toggleMobileMenu sur mobile */}
        <div className="fixed top-0 left-0 right-0 z-50 h-20">
          <SecretaryHeader
            onViewChange={(view) => { onViewChange(view); closeMobileMenu(); }}
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
            onViewChange={(view) => { onViewChange(view); closeMobileMenu(); }}
            isMobile={isMobile}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onLogout={requestLogout}
          />
        </div>

        {/* Contenu */}
        <div className={`pt-20 transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-70'
        }`}>
          <main className={isMobile ? 'p-4' : 'p-10'}>
            {children}
          </main>
        </div>

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