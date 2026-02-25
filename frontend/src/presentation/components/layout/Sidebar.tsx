import { Home, Users, UserCheck, Bed, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  {
    id: 'home',
    label: 'Accueil',
    path: '/dashboard',
    icon: Home,
    subtitle: "Vue d'ensemble",
  },
  {
    id: 'patients',
    label: 'Les patients',
    icon: Users,
    children: [
      {
        id: 'patients-externes',
        label: 'Patients externes',
        path: '/patients/externes',
        icon: UserCheck,
      },
      {
        id: 'patients-hospitalises',
        label: 'Patients hospitalisés',
        path: '/patients/hospitalises',
        icon: Bed,
      },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('patients');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isActive = location.pathname === item.path;

          return (
            <div key={item.id}>
              {hasChildren ? (
                // Accordion logic for items with children
                <div>
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full p-3 rounded-xl text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === item.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openSubmenu === item.id && (
                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.id}
                            to={child.path}
                            className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                              location.pathname === child.path 
                                ? 'bg-cyan-50 text-cyan-600' 
                                : 'text-gray-500 hover:text-cyan-600'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Simple link for items without children
                <Link
                  to={item.path || '#'}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isActive ? 'bg-cyan-600 text-white' : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium leading-none">{item.label}</p>
                    {item.subtitle && <p className="text-[10px] mt-1 opacity-70">{item.subtitle}</p>}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}