import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Détecter la vue actuelle depuis l'URL
  const getCurrentView = (): string => {
    const path = location.pathname.replace('/dashboard/', '');
    if (path === '' || path === 'dashboard') return 'dashboard';
    if (path === 'home') return 'dashboard';
    return path;
  };

  const currentView = getCurrentView();

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation
  const handleViewChange = (view: string) => {
    // ✅ NE PAS naviguer si déjà sur la vue
    if (currentView === view) {
      return;
    }
    
    const routes: Record<string, string> = {
      'dashboard': '/dashboard/home',
      'patients-externes': '/dashboard/patients-externes',
      'patients-hospitalises': '/dashboard/patients-hospitalises',
      'users': '/dashboard/users',
      'beds': '/dashboard/beds',
      'statistics': '/dashboard/statistics',
      'security': '/dashboard/security',
      'appointments': '/dashboard/appointments',
    };

    navigate(routes[view] || '/dashboard/home');

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-40 ${
          isMobile 
            ? `w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : isSidebarCollapsed ? 'w-20' : 'w-70'
        }`}
      >
        <AdminSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-70'}`}>
        <div className="sticky top-0 z-30">
          <AdminHeader />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}