import { BarChart3, ClipboardList, Calendar, Users, Bed, LogOut, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

interface DoctorSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

const navigationItems = [
  { 
    section: "STATISTIQUES",
    items: [
      { icon: BarChart3, label: "Statistiques", view: "dashboard" }
    ]
  },
  {
    section: "PATIENTS", 
    items: [
      { 
        icon: ClipboardList, 
        label: "Patients", 
        view: "dossiers",
        hasSubmenu: true,
        submenu: [
          { icon: Users, label: "Patients Externes", view: "patients-externes" },
          { icon: Bed, label: "Patients Hospitalisés", view: "patients-hospitalises" }
        ]
      }
    ]
  },
  {
    section: "GESTION RDV",
    items: [
      { icon: Calendar, label: "Planning", view: "planning" }
    ]
  }
];

export function DoctorSidebar({
  currentView,
  onViewChange,
  isMobile,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout,
  userRole
}: DoctorSidebarProps) {
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(false);
  const submenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Garder le submenu ouvert si on est dans une vue patients
  useEffect(() => {
    const isPatientView = ['dossiers', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatientView) {
      setPatientsSubmenuOpen(true);
    }
  }, [currentView]);

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
    const isPatientView = ['dossiers', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatientView) return;
    
    submenuTimerRef.current = setTimeout(() => {
      setPatientsSubmenuOpen(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full py-8">
      {/* Toggle button */}
      {!isMobile && (
        <button
          onClick={onToggleSidebar}
          className="absolute -right-3 top-6 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-10"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-10">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 px-8">
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
                  <button
                    onClick={() => !item.hasSubmenu && item.view && onViewChange(item.view)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-8'
                    } py-4 text-left transition-all border-r-4 group ${
                      currentView === item.view || (item.hasSubmenu && patientsSubmenuOpen)
                        ? 'bg-blue-50 text-blue-600 border-blue-600'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-transparent'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'gap-0' : 'gap-4'}`}>
                      <item.icon className={`w-5 h-5 ${
                        currentView === item.view ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      {!isSidebarCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                    
                    {!isSidebarCollapsed && item.hasSubmenu && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        patientsSubmenuOpen ? 'rotate-0' : '-rotate-90'
                      }`} />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.hasSubmenu && patientsSubmenuOpen && !isSidebarCollapsed && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu?.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => onViewChange(subItem.view)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                            currentView === subItem.view
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                          }`}
                        >
                          <subItem.icon className={`w-4 h-4 ${
                            currentView === subItem.view ? 'text-white' : 'text-gray-400'
                          }`} />
                          <span className="text-sm">{subItem.label}</span>
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

      {/* Logout button */}
      <div className="px-8 pt-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && "Déconnexion"}
        </Button>
      </div>
    </div>
  );
}