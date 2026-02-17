import { ReactNode, useState } from 'react';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { useMobileMenu } from '../../hooks/useMobileMenu';
import { MobileMenuButton } from '../common/MobileMenuButton';
import { SidebarOverlay } from '../common/SidebarOverlay';

interface DoctorLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

export function DoctorLayout({ 
  children, 
  currentView, 
  onViewChange, 
  onLogout,
  userRole 
}: DoctorLayoutProps) {
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Menu Button */}
      <MobileMenuButton 
        isOpen={isMobileMenuOpen}
        onToggle={toggleMobileMenu}
        isMobile={isMobile}
      />

      {/* Sidebar Overlay */}
      <SidebarOverlay 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        isMobile={isMobile}
      />

      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-40 h-20">
        <DoctorHeader 
          onViewChange={(view) => {
            onViewChange(view);
            closeMobileMenu();
          }}
          userRole={userRole}
        />
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 z-30 overflow-y-auto transition-all duration-300 ${
        isMobile 
          ? `w-70 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : isSidebarCollapsed ? 'w-20' : 'w-70'
      }`}>
        <DoctorSidebar
          currentView={currentView}
          onViewChange={(view) => {
            onViewChange(view);
            closeMobileMenu();
          }}
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={onLogout}
          userRole={userRole}
        />
      </div>

      {/* Main Content */}
      <div className={`pt-20 transition-all duration-300 ${
        isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-70'
      }`}>
        <main className={`${isMobile ? 'p-4' : 'p-10'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}