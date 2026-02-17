import { ReactNode, useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function AdminLayout({ children, currentView, onViewChange, onLogout }: AdminLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      )}

      {/* Overlay (Mobile) */}
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
            : isSidebarCollapsed 
              ? 'w-20' 
              : 'w-70'
        }`}
      >
        <AdminSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={onLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${
          isMobile 
            ? 'ml-0' 
            : isSidebarCollapsed 
              ? 'ml-20' 
              : 'ml-70'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30">
          <AdminHeader />
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}