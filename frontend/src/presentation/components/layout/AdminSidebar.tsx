import { Home, Users, Calendar, Bed, BarChart3, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Logo } from '../common/Logo';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const navigationItems = [
  { 
    section: "NAVIGATION PRINCIPALE",
    items: [
      { icon: Home, label: "Accueil", view: "dashboard", subtitle: "Vue d'ensemble" },
      { 
        icon: Users, 
        label: "Patients", 
        hasSubmenu: true,
        submenu: [
          { icon: Users, label: "Patients Externes", view: "patients-externes" },
          { icon: Bed, label: "Patients Hospitalisés", view: "patients-hospitalises" }
        ]
      },
      { icon: Calendar, label: "Planning", view: "appointments" },
      { icon: Bed, label: "Lits", view: "beds" },
      { icon: BarChart3, label: "Statistiques", view: "statistics" },
      { icon: Users, label: "Utilisateurs", view: "users" },
      { icon: Shield, label: "Sécurité", view: "security", subtitle: "Authentification" }
    ]
  }
];

export function AdminSidebar({
  currentView,
  onViewChange,
  isMobile,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout
}: AdminSidebarProps) {
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(false);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) {
        clearTimeout(submenuTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
    }
    setPatientsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (currentView === 'patients-externes' || currentView === 'patients-hospitalises') {
      return;
    }
    submenuTimerRef.current = setTimeout(() => {
      setPatientsSubmenuOpen(false);
    }, 200);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo Section */}
      <div className={`p-6 border-b border-gray-200 relative ${isSidebarCollapsed && !isMobile ? 'px-2' : ''}`}>
        {!isSidebarCollapsed || isMobile ? (
          <div className="flex items-center gap-3">
            {/* ✅ Logo noir, taille appropriée */}
            <Logo size={isMobile ? 40 : 48} variant="dark" />
            
            {!isMobile && (
              <div>
                <h1 className="font-bold text-lg text-cyan-600">CENHOSOA</h1>
                <p className="text-xs text-gray-500">Gestion Hospitalière</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <Logo size={36} variant="dark" />
          </div>
        )}
        
        {/* Collapse Button - Desktop Only */}
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className="absolute top-6 -right-3 bg-white border-2 border-gray-200 rounded-full p-1 hover:bg-cyan-50 hover:border-cyan-300 transition-colors shadow-md z-10"
            title={isSidebarCollapsed ? "Développer" : "Réduire"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-cyan-600" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            {/* Section Title */}
            {!isSidebarCollapsed && !isMobile && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {section.section}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  onMouseEnter={() => item.hasSubmenu && !isMobile && handleMouseEnter()}
                  onMouseLeave={() => item.hasSubmenu && !isMobile && handleMouseLeave()}
                >
                  {/* Main Navigation Item */}
                  <button
                    onClick={() => !item.hasSubmenu && item.view && onViewChange(item.view)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'gap-3 px-3'
                    } py-2.5 rounded-lg text-left transition-all duration-200 group ${
                      currentView === item.view || (item.hasSubmenu && patientsSubmenuOpen)
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      currentView === item.view || (item.hasSubmenu && patientsSubmenuOpen)
                        ? 'text-cyan-700' 
                        : 'text-gray-500 group-hover:text-cyan-600'
                    }`} />
                    
                    {(!isSidebarCollapsed || isMobile) && (
                      <>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            currentView === item.view ? 'text-cyan-700' : ''
                          }`}>
                            {item.label}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                          )}
                        </div>
                        
                        {item.hasSubmenu && (
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                            patientsSubmenuOpen ? 'rotate-90 text-cyan-600' : 'text-gray-400'
                          }`} />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.hasSubmenu && patientsSubmenuOpen && (!isSidebarCollapsed || isMobile) && (
                    <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.submenu?.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => onViewChange(subItem.view)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                            currentView === subItem.view
                              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-700'
                          }`}
                        >
                          <subItem.icon className={`w-4 h-4 ${
                            currentView === subItem.view ? 'text-cyan-700' : 'text-gray-400'
                          }`} />
                          <span className="text-sm font-medium">{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${
            isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'gap-3 px-3'
          } py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:border hover:border-red-200 transition-all group`}
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="text-sm font-medium">Déconnexion</span>
          )}
        </button>
      </div>
    </div>
  );
}