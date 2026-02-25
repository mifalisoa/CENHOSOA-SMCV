import { CalendarDays, Calendar, Users, Bed, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
// Correction : Import de type uniquement pour LucideIcon
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

// --- Types et Interfaces ---

interface SubmenuItem {
  icon: LucideIcon;
  label: string;
  view: string;
}

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  view?: string;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

interface SecretarySidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

// --- Configuration de la Navigation ---

const navigationItems: NavigationSection[] = [
  { 
    section: "STATISTIQUES",
    items: [
      { icon: CalendarDays, label: "Statistiques", view: "dashboard" }
    ]
  },
  { 
    section: "GESTION RDV",
    items: [
      { icon: Calendar, label: "Planning", view: "planning" }
    ]
  },
  { 
    section: "PATIENTS",
    items: [
      { 
        icon: Users, 
        label: "Patients",
        hasSubmenu: true,
        submenu: [
          { icon: Users, label: "Patients Externes", view: "patients-externes" },
          { icon: Bed, label: "Patients Hospitalisés", view: "patients-hospitalises" }
        ]
      }
    ]
  }
];

// --- Composant Principal ---

export function SecretarySidebar({
  currentView,
  onViewChange,
  isMobile,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout
}: SecretarySidebarProps) {
  const [patientsSubmenuOpen, setPatientsSubmenuOpen] = useState(false);
  const [prevView, setPrevView] = useState(currentView);
  
  // Utilisation de number pour le timer pour éviter l'erreur d'espace de noms NodeJS
  const submenuTimerRef = useRef<number | null>(null);

  /**
   * Synchronisation de l'état pendant le rendu (Pattern recommandé par React)
   * Cela remplace le useEffect et évite les rendus en cascade (cascading renders).
   */
  if (currentView !== prevView) {
    setPrevView(currentView);
    const isPatientView = ['patients', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatientView && !patientsSubmenuOpen) {
      setPatientsSubmenuOpen(true);
    }
  }

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) {
        window.clearTimeout(submenuTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (submenuTimerRef.current) window.clearTimeout(submenuTimerRef.current);
    setPatientsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    const isPatientView = ['patients', 'patients-externes', 'patients-hospitalises'].includes(currentView);
    if (isPatientView) return;
    
    submenuTimerRef.current = window.setTimeout(() => {
      setPatientsSubmenuOpen(false);
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Bouton Toggle pour réduire la barre latérale */}
      {!isMobile && (
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Agrandir" : "Réduire"}
          className="absolute -right-3 top-6 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-md z-10"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {/* Navigation Principale */}
      <div className="flex-1 overflow-y-auto py-8">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-10">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 px-8">
                {section.section}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = item.view === currentView || (item.hasSubmenu && patientsSubmenuOpen);
                
                return (
                  <div 
                    key={itemIndex}
                    onMouseEnter={() => item.hasSubmenu && !isMobile && handleMouseEnter()}
                    onMouseLeave={() => item.hasSubmenu && !isMobile && handleMouseLeave()}
                  >
                    <button
                      onClick={() => !item.hasSubmenu && item.view && onViewChange(item.view)}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-8'
                      } py-4 text-left transition-all duration-300 border-r-4 group ${
                        isActive
                          ? 'bg-green-50 text-green-600 border-green-600'
                          : 'text-gray-600 hover:bg-green-50 hover:text-green-600 border-transparent'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'gap-0' : 'gap-4'}`}>
                        <item.icon className={`w-5 h-5 ${
                          isActive ? 'text-green-600' : 'text-gray-500'
                        }`} />
                        {!isSidebarCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
                      
                      {!isSidebarCollapsed && item.hasSubmenu && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          patientsSubmenuOpen ? 'rotate-90' : ''
                        }`} />
                      )}
                    </button>
                    
                    {/* Sous-menu (Patients) */}
                    {item.hasSubmenu && patientsSubmenuOpen && !isSidebarCollapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu?.map((subItem, subIndex) => {
                          const isSubActive = currentView === subItem.view;
                          return (
                            <button
                              key={subIndex}
                              onClick={() => onViewChange(subItem.view)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                                isSubActive
                                  ? 'bg-green-50 text-green-600'
                                  : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              <subItem.icon className={`w-4 h-4 ${
                                isSubActive ? 'text-green-600' : 'text-gray-500'
                              }`} />
                              <span className="text-sm font-medium">{subItem.label}</span>
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

      {/* Pied de page avec bouton Déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isSidebarCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}