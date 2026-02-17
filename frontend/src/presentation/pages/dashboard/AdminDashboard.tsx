import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import DashboardHome from './sections/admin/DashboardHome';
import PatientsExternesView from './sections/admin/PatientsExternesView'; // ✅ IMPORT

type AdminView = 'dashboard' | 'users' | 'beds' | 'statistics' | 'security' | 
                 'appointments' | 'patients-externes' | 'patients-hospitalises';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome />;
      
      case 'patients-externes':
        return <PatientsExternesView />; // ✅ CHANGEMENT ICI
      
      case 'patients-hospitalises':
        return <div className="p-8 text-center text-gray-500">Patients hospitalisés (à implémenter)</div>;
      
      case 'users':
        return <div className="p-8 text-center text-gray-500">Gestion des utilisateurs (à implémenter)</div>;
      
      case 'beds':
        return <div className="p-8 text-center text-gray-500">Gestion des lits (à implémenter)</div>;
      
      case 'statistics':
        return <div className="p-8 text-center text-gray-500">Statistiques (à implémenter)</div>;
      
      case 'security':
        return <div className="p-8 text-center text-gray-500">Sécurité (à implémenter)</div>;
      
      case 'appointments':
        return <div className="p-8 text-center text-gray-500">Planning (à implémenter)</div>;
      
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={(view) => setCurrentView(view as AdminView)}
      onLogout={handleLogout}
    >
      {renderView()}
    </AdminLayout>
  );
}