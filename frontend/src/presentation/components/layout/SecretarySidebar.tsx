// frontend/src/presentation/components/layout/SecretarySidebar.tsx

import { CalendarDays, Calendar, Users, Bed, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

interface SubmenuItem {
  icon:  LucideIcon;
  label: string;
  view:  string;
}

interface NavigationItem {
  icon:        LucideIcon;
  label:       string;
  view?:       string;
  hasSubmenu?: boolean;
  submenu?:    SubmenuItem[];
}

interface NavigationSection {
  section: string;
  items:   NavigationItem[];
}

interface SecretarySidebarProps {
  currentView:        string;
  onViewChange:       (view: string) => void;
  isMobile:           boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar:    () => void;
  onLogout:           () => void;
}

const navigationItems: NavigationSection[] = [
  {
    section: 'STATISTIQUES',
    items: [{ icon: CalendarDays, label: 'Statistiques', view: 'dashboard' }],
  },
  {
    section: 'GESTION RDV',
    items: [{ icon: Calendar, label: 'Planning', view: 'planning' }],
  },
  {
    section: 'PATIENTS',
    items: [
      {
        icon: Users,
        label: 'Patients',
        hasSubmenu: true,
        submenu: [
          { icon: Users, label: 'Patients Externes',     view: 'patients-externes'    },
          { icon: Bed,   label: 'Patients Hospitalisés', view: 'patients-hospitalises' },
        ],
      },
    ],
  },
];

export function SecretarySidebar({
  currentView,
  onViewChange,
  isMobile,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: SecretarySidebarProps) {
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(false);
  const [prevView,            setPrevView]            = useState(currentView);
  const submenuTimerRef = useRef<number | null>(null);

  if (currentView !== prevView) {
    setPrevView(currentView);
    const isPatient = ['patients', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatient && !patientsSubmenuOpen) setPatientsSubmenuOpen(true);
  }

  useEffect(() => {
    return () => { if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current); };
  }, []);

  const handleMouseEnter = () => {
    if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current);
    setPatientsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    const isPatient = ['patients', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatient) return;
    submenuTimerRef.current = window.setTimeout(() => setPatientsSubmenuOpen(false), 150);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* Bouton collapse */}
      {!isMobile && (
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Agrandir' : 'Réduire'}
          className="absolute -right-3 top-6 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-10"
        >
          {isSidebarCollapsed
            ? <ChevronRight className="w-4 h-4 text-gray-600" />
            : <ChevronLeft  className="w-4 h-4 text-gray-600" />}
        </button>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-8">
        {navigationItems.map((section, si) => (
          <div key={si} className="mb-10">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 px-8">
                {section.section}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item, ii) => {
                const isActive = item.view === currentView ||
                  (item.hasSubmenu && ['patients','patients-externes','patients-hospitalises'].includes(currentView));

                return (
                  <div
                    key={ii}
                    onMouseEnter={() => item.hasSubmenu && !isMobile && handleMouseEnter()}
                    onMouseLeave={() => item.hasSubmenu && !isMobile && handleMouseLeave()}
                  >
                    <button
                      onClick={() => !item.hasSubmenu && item.view && onViewChange(item.view)}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-8'
                      } py-4 text-left transition-all border-r-4 group ${
                        isActive
                          ? 'bg-cyan-50 text-cyan-600 border-cyan-600'
                          : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 border-transparent'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'gap-0' : 'gap-4'}`}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'text-gray-500'}`} />
                        {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.hasSubmenu && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${patientsSubmenuOpen ? 'rotate-90' : ''}`} />
                      )}
                    </button>

                    {/* Sous-menu patients */}
                    {item.hasSubmenu && patientsSubmenuOpen && !isSidebarCollapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu?.map((sub, subI) => {
                          const isSubActive = currentView === sub.view;
                          return (
                            <button
                              key={subI}
                              onClick={() => onViewChange(sub.view)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                                isSubActive
                                  ? 'bg-cyan-600 text-white'
                                  : 'text-gray-600 hover:bg-cyan-100 hover:text-cyan-700'
                              }`}
                            >
                              <sub.icon className={`w-4 h-4 ${isSubActive ? 'text-white' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 flex items-center justify-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}