// frontend/src/presentation/components/layout/DoctorSidebar.tsx

import {
  Home, ClipboardList, Calendar,
  Users, Bed, LogOut, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useState, useEffect, useRef, useMemo } from 'react';

interface SubmenuItem {
  icon:  LucideIcon;
  label: string;
  path:  string;
}

interface NavigationItem {
  icon:          LucideIcon;
  label:         string;
  path?:         string;
  hasSubmenu?:   boolean;
  submenu?:      SubmenuItem[];
  rolesAllowed?: string[];
}

interface DoctorSidebarProps {
  isMobile:           boolean;
  isSidebarCollapsed: boolean;
  onLogout:           () => void;
  userRole:           string;
}

// Liste plate — pas de sections redondantes
const navigationItems: NavigationItem[] = [
  {
    icon:  Home,
    label: 'Accueil',
    path:  '/doctor',
  },
  {
    icon:       ClipboardList,
    label:      'Patients',
    hasSubmenu: true,
    submenu: [
      { icon: Users, label: 'Patients Externes',     path: '/doctor/patients-externes'     },
      { icon: Bed,   label: 'Patients Hospitalisés', path: '/doctor/patients-hospitalises'  },
    ],
  },
  {
    icon:         Calendar,
    label:        'Planning RDV',
    path:         '/doctor/planning',
    rolesAllowed: ['medecin', 'admin'],
  },
];

export function DoctorSidebar({ isMobile, isSidebarCollapsed, onLogout, userRole }: DoctorSidebarProps) {

  // ── Déclarer location et isPatientPage EN PREMIER ─────────────────────────
  const location = useLocation();
  const submenuTimerRef = useRef<number | null>(null);

  const isPatientPage = useMemo(
    () =>
      location.pathname.startsWith('/doctor/patients-externes')     ||
      location.pathname.startsWith('/doctor/patients-hospitalises') ||
      location.pathname.includes('/doctor/patients/'),
    [location.pathname]
  );

  const isDossierPage = useMemo(
    () => location.pathname.includes('/doctor/patients/') && location.pathname.includes('/dossier'),
    [location.pathname]
  );

  // ── Maintenant on peut utiliser isPatientPage comme valeur initiale ────────
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(isPatientPage);
  const [dossierOrigin, setDossierOrigin] = useState<'externe' | 'hospitalise' | null>(null);

  // ... reste inchangé

  useEffect(() => {
    if (location.pathname.startsWith('/doctor/patients-externes')) {
      setDossierOrigin('externe');
    } else if (location.pathname.startsWith('/doctor/patients-hospitalises')) {
      setDossierOrigin('hospitalise');
    }
  }, [location.pathname]);

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
    return () => { if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current); };
  }, []);

 const isSubItemActive = (path: string): boolean => {
  if (!isDossierPage) return false;

  const fromState = (location.state as { from?: string } | null)?.from;
  if (fromState === 'externes'     && path.includes('patients-externes'))     return true;
  if (fromState === 'hospitalises' && path.includes('patients-hospitalises')) return true;

  if (path.includes('patients-externes')     && dossierOrigin === 'externe')     return true;
  if (path.includes('patients-hospitalises') && dossierOrigin === 'hospitalise') return true;

  return false;
};

  const visibleItems = navigationItems.filter(item => {
    if (!item.rolesAllowed) return true;
    return item.rolesAllowed.includes(userRole);
  });

  return (
    <div className="flex flex-col h-full py-8">

      {!isMobile && (
        <button
          className="absolute -right-3 top-6 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-10"
          type="button"
          aria-label={isSidebarCollapsed ? 'Étendre' : 'Réduire'}
        >
          {isSidebarCollapsed
            ? <ChevronDown className="w-4 h-4 text-gray-600 rotate-90" />
            : <ChevronDown className="w-4 h-4 text-gray-600 -rotate-90" />}
        </button>
      )}

      <div className="flex-1 overflow-y-auto pt-4">
        <div className="space-y-1">
          {visibleItems.map((item, i) => {
            const hasSubmenu = !!item.hasSubmenu;

            return (
              <div
                key={i}
                onMouseEnter={() => hasSubmenu && !isMobile && handleMouseEnter()}
                onMouseLeave={() => hasSubmenu && !isMobile && handleMouseLeave()}
              >
                {item.path ? (
                  <NavLink
                    to={item.path}
                    end={item.path === '/doctor'}
                    className={({ isActive }) =>
                      `w-full flex items-center ${
                        isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'px-8'
                      } py-4 text-left transition-all border-r-4 ${
                        isActive
                          ? 'bg-cyan-50 text-cyan-600 border-cyan-600'
                          : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'gap-0' : 'gap-4'}`}>
                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600' : 'text-gray-500'}`} />
                        {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                    )}
                  </NavLink>
                ) : (
                  <div className={`w-full flex items-center justify-between px-8 py-4 cursor-default transition-all border-r-4 ${
                    isPatientPage
                      ? 'text-cyan-600 bg-cyan-50/50 border-cyan-200'
                      : 'text-gray-600 border-transparent'
                  }`}>
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-5 h-5 shrink-0 ${isPatientPage ? 'text-cyan-500' : 'text-gray-500'}`} />
                      {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${patientsSubmenuOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                )}

                {/* Sous-menu */}
                {hasSubmenu && patientsSubmenuOpen && !isSidebarCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu?.map((sub, si) => (
                      <NavLink key={si} to={sub.path}
                        className={({ isActive }) => {
                          const active = isActive || isSubItemActive(sub.path);
                          return `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                            active
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-cyan-100 hover:text-cyan-700'
                          }`;
                        }}
                      >
                        {({ isActive }) => {
                          const active = isActive || isSubItemActive(sub.path);
                          return (
                            <>
                              <sub.icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">{sub.label}</span>
                            </>
                          );
                        }}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-8 pt-4 border-t border-gray-200">
        <Button onClick={onLogout}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white">
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && 'Déconnexion'}
        </Button>
      </div>
    </div>
  );
}