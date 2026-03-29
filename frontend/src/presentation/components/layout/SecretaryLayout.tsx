// frontend/src/presentation/components/layout/SecretaryLayout.tsx

import { useState }              from 'react';
import type { ReactNode }        from 'react';
import { SecretarySidebar }      from './SecretarySidebar';
import { SecretaryHeader }       from './SecretaryHeader';
import { LogoutConfirmModal }    from '../common/LogoutConfirmModal';
import { useMobileMenu }         from '../../hooks/useMobileMenu';
import { useLogout }             from '../../hooks/useLogout';
import { MobileMenuButton }      from '../common/MobileMenuButton';
import { SidebarOverlay }        from '../common/SidebarOverlay';
// ✅ Même provider que admin et docteur
import { NotificationsProvider } from '../../context/NotificationsContext';

interface SecretaryLayoutProps {
  children:     ReactNode;
  currentView:  string;
  onViewChange: (view: string) => void;
  onLogout:     () => void;
}

export function SecretaryLayout({ children, currentView, onViewChange }: SecretaryLayoutProps) {
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    showLogoutModal, requestLogout, cancelLogout, confirmLogout,
    userName, userRole,
  } = useLogout();

  return (
    // ✅ NotificationsProvider → une seule connexion Socket.io pour le secrétaire
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">
        <MobileMenuButton
          isOpen={isMobileMenuOpen}
          onToggle={toggleMobileMenu}
          isMobile={isMobile}
        />
        <SidebarOverlay
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          isMobile={isMobile}
        />

        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 h-20">
          <SecretaryHeader
            onViewChange={(view) => { onViewChange(view); closeMobileMenu(); }}
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

        {/* Modal confirmation déconnexion */}
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