// frontend/src/presentation/components/layout/DoctorLayout.tsx

import { Outlet }             from 'react-router-dom';
import { DoctorSidebar }      from './DoctorSidebar';
import { DoctorHeader }       from './DoctorHeader';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';
import { useMobileMenu }      from '../../hooks/useMobileMenu';
import { useLogout }          from '../../hooks/useLogout';
import { MobileMenuButton }   from '../common/MobileMenuButton';
import { SidebarOverlay }     from '../common/SidebarOverlay';

interface DoctorLayoutProps {
  onLogout: () => void; // conservé pour compatibilité avec App.tsx
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

export function DoctorLayout({ userRole }: DoctorLayoutProps) {
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const {
    showLogoutModal, requestLogout, cancelLogout, confirmLogout,
    userName, userRole: role,
  } = useLogout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
      <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-white border-b shadow-sm">
        <DoctorHeader
          userRole={userRole}
          toggleMobileMenu={toggleMobileMenu}
        />
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 z-30 overflow-y-auto w-72 transition-all duration-300 ${
        isMobile
          ? isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          : 'translate-x-0'
      }`}>
        <DoctorSidebar
          isMobile={isMobile}
          isSidebarCollapsed={false}
          onLogout={requestLogout}  // ← ouvre le modal
        />
      </div>

      {/* Contenu */}
      <div className={`pt-20 transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-72'}`}>
        <main className={isMobile ? 'p-4' : 'p-10'}>
          <Outlet />
        </main>
      </div>

      {/* Modal confirmation déconnexion */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        userName={userName}
        userRole={role}
      />
    </div>
  );
}