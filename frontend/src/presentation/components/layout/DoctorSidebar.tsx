// frontend/src/presentation/components/layout/DoctorSidebar.tsx

import {
  BarChart3,
  ClipboardList,
  Calendar,
  Users,
  Bed,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useState, useEffect, useRef, useMemo } from 'react';

interface SubmenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

interface DoctorSidebarProps {
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  onLogout: () => void;
}

const navigationItems: NavigationSection[] = [
  {
    section: 'STATISTIQUES',
    items: [{ icon: BarChart3, label: 'Statistiques', path: '/doctor' }],
  },
  {
    section: 'PATIENTS',
    items: [
      {
        icon: ClipboardList,
        label: 'Patients',
        hasSubmenu: true,
        submenu: [
          { icon: Users, label: 'Patients Externes', path: '/doctor/patients-externes' },
          { icon: Bed, label: 'Patients Hospitalisés', path: '/doctor/patients-hospitalises' },
        ],
      },
    ],
  },
  {
    section: 'GESTION RDV',
    items: [{ icon: Calendar, label: 'Planning', path: '/doctor/planning' }],
  },
];

export function DoctorSidebar({
  isMobile,
  isSidebarCollapsed,
  onLogout,
}: DoctorSidebarProps) {
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(false);
  const submenuTimerRef = useRef<number | null>(null);
  const location = useLocation();

  // Calcul dérivé avec useMemo → évite les warnings react-hooks dans la plupart des configs
  const isPatientPage = useMemo(
    () =>
      ['/doctor/patients-externes', '/doctor/patients-hospitalises'].some((p) =>
        location.pathname.startsWith(p)
      ) || location.pathname.includes('/doctor/patient/'),
    [location.pathname]
  );

  // Mise à jour du state en fonction de la valeur mémoïsée
  useEffect(() => {
    setPatientsSubmenuOpen(isPatientPage);
  }, [isPatientPage]);

  const handleMouseEnter = () => {
    if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current);
    setPatientsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    submenuTimerRef.current = window.setTimeout(() => setPatientsSubmenuOpen(false), 300);
  };

  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full py-8">
      {/* Toggle sidebar – à réactiver si tu veux vraiment gérer le collapse */}
      {!isMobile && (
        <button
          // onClick={onToggleSidebar}  ← décommente + ajoute la prop quand tu l'implémentes
          className="absolute -right-3 top-6 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-10"
          type="button"
          aria-label={isSidebarCollapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
        >
          {isSidebarCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-600 rotate-90" /> 
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 -rotate-90" />
          )}
        </button>
      )}

      <div className="flex-1 overflow-y-auto">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-10">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 px-8">
                {section.section}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const hasSubmenu = !!item.hasSubmenu;

                return (
                  <div
                    key={itemIndex}
                    onMouseEnter={() => hasSubmenu && !isMobile && handleMouseEnter()}
                    onMouseLeave={() => hasSubmenu && !isMobile && handleMouseLeave()}
                  >
                    {item.path ? (
                      <NavLink
                        to={item.path}
                        end={item.path === '/doctor'}
                        className={({ isActive }) =>
                          `w-full flex items-center ${
                            isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-8'
                          } py-4 text-left transition-all border-r-4 group ${
                            isActive
                              ? 'bg-cyan-50 text-cyan-600 border-cyan-600'
                              : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'gap-0' : 'gap-4'}`}>
                              <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'text-gray-500'}`} />
                              {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                            </div>
                            {!isSidebarCollapsed && hasSubmenu && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  patientsSubmenuOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    ) : (
                      // Élément non cliquable "Patients"
                      <div
                        className={`w-full flex items-center justify-between px-8 py-4 text-left transition-all border-r-4 group cursor-default ${
                          patientsSubmenuOpen ||
                          location.pathname.includes('/patients-') ||
                          location.pathname.includes('/patient/')
                            ? 'text-cyan-600 bg-cyan-50/50'
                            : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className="w-5 h-5 text-gray-500" />
                          {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              patientsSubmenuOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        )}
                      </div>
                    )}

                    {hasSubmenu && patientsSubmenuOpen && !isSidebarCollapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu?.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                                isActive
                                  ? 'bg-cyan-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:bg-cyan-100 hover:text-cyan-700'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <subItem.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">{subItem.label}</span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-8 pt-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && 'Déconnexion'}
        </Button>
      </div>
    </div>
  );
}