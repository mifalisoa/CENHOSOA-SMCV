// frontend/src/presentation/components/layout/AdminLayout.tsx

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AdminSidebar }         from './AdminSidebar';
import { AdminHeader }          from './AdminHeader';
import { LogoutConfirmModal }   from '../common/LogoutConfirmModal';
import { useLogout }            from '../../hooks/useLogout';
import { Menu, X }              from 'lucide-react';

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isMobile,           setIsMobile]           = useState(false);
  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    showLogoutModal, requestLogout, cancelLogout, confirmLogout,
    userName, userRole,
  } = useLogout();

  const getCurrentView = (): string => {
    if (location.pathname.includes('/patients-externes'))    return 'patients-externes';
    if (location.pathname.includes('/patients-hospitalises')) return 'patients-hospitalises';
    if (location.pathname.includes('/users') || location.pathname.includes('/utilisateurs')) return 'users';
    if (location.pathname.includes('/beds'))                 return 'beds';
    if (location.pathname.includes('/statistics') || location.pathname.includes('/statistiques')) return 'statistics';
    if (location.pathname.includes('/securite') || location.pathname.includes('/security')) return 'security';
    if (location.pathname.includes('/appointments') || location.pathname.includes('/planning')) return 'appointments';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: string) => {
    const routes: Record<string, string> = {
      'dashboard':             '/dashboard',
      'patients-externes':     '/patients-externes',
      'patients-hospitalises': '/patients-hospitalises',
      'users':                 '/utilisateurs',
      'beds':                  '/beds',
      'statistics':            '/statistiques',
      'security':              '/securite',
      'appointments':          '/planning',
    };
    navigate(routes[view] || '/dashboard');
    if (isMobile) setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Bouton menu mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-40 ${
        isMobile
          ? `w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
          : isSidebarCollapsed ? 'w-20' : 'w-70'
      }`}>
        <AdminSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={requestLogout}  // ← ouvre le modal au lieu de déconnecter directement
        />
      </aside>

      {/* Contenu principal */}
      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-70'
      }`}>
        <div className="sticky top-0 z-30">
          <AdminHeader />
        </div>
        <main className="p-6">
          <Outlet />
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
  );
}