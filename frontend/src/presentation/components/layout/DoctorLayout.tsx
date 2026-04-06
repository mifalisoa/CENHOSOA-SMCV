// frontend/src/presentation/components/layout/DoctorLayout.tsx

import { Outlet }                from 'react-router-dom';
import { useNavigate }           from 'react-router-dom';  // ✅ nouveau
import { useCallback }           from 'react';              // ✅ nouveau
import { DoctorSidebar }         from './DoctorSidebar';
import { DoctorHeader }          from './DoctorHeader';
import { LogoutConfirmModal }    from '../common/LogoutConfirmModal';
import { useMobileMenu }         from '../../hooks/useMobileMenu';
import { useLogout }             from '../../hooks/useLogout';
import { MobileMenuButton }      from '../common/MobileMenuButton';
import { SidebarOverlay }        from '../common/SidebarOverlay';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { useSessionTimeout }     from '../../hooks/useSessionTimeout';  // ✅ nouveau
import { useAuth }               from '../../hooks/useAuth';             // ✅ nouveau
import { toast }                 from 'sonner';     
import { HelpButton } from '../common/HelpButton';                     // ✅ nouveau

interface DoctorLayoutProps {
  onLogout:     () => void;
  userRole:     'docteur' | 'interne' | 'stagiaire';
  sidebarRole?: string;
}

export function DoctorLayout({ userRole, sidebarRole }: DoctorLayoutProps) {
  const navigate = useNavigate();        // ✅ nouveau
  const { logout } = useAuth();         // ✅ nouveau
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const {
    showLogoutModal, requestLogout, cancelLogout, confirmLogout,
    userName, userRole: role,
  } = useLogout();

  // ✅ Timeout de session — deconnexion apres 3 minutes d'inactivite
  const handleTimeout = useCallback(async () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    toast.error('Session expiree. Veuillez vous reconnecter.');
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  useSessionTimeout({ onTimeout: handleTimeout });  // ✅ nouveau

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <MobileMenuButton isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} isMobile={isMobile} />
        <SidebarOverlay   isOpen={isMobileMenuOpen} onClose={closeMobileMenu}   isMobile={isMobile} />

        <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-white border-b shadow-sm">
          <DoctorHeader userRole={userRole} toggleMobileMenu={toggleMobileMenu} />
        </div>

        <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 z-30 overflow-y-auto w-72 transition-all duration-300 ${
          isMobile
            ? isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            : 'translate-x-0'
        }`}>
          <DoctorSidebar
            isMobile={isMobile}
            isSidebarCollapsed={false}
            onLogout={requestLogout}
            userRole={sidebarRole ?? userRole}
          />
        </div>

        <div className={`pt-20 transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-72'}`}>
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
          userRole={role}
        />
      </div>
    </NotificationsProvider>
  );
}