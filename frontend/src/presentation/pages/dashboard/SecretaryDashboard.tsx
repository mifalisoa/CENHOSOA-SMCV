import { useState } from 'react';
import { SecretaryLayout } from '../../components/layout/SecretaryLayout';
import { SecretaryDashboardStats } from './sections/SecretaryDashboardStats';
import { SecretaryPatientsList } from './sections/SecretaryPatientsList';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SecretaryDashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <SecretaryDashboardStats 
          onNewAppointment={() => setCurrentView('planning')}
          onViewPlanning={() => setCurrentView('planning')}
        />;
      case 'planning':
        return <div>Planning RDV (à implémenter)</div>;
      case 'patients-externes':
        return <SecretaryPatientsList filterType="externe" />;
      case 'patients-hospitalises':
        return <SecretaryPatientsList filterType="hospitalise" />;
      default:
        return <SecretaryDashboardStats 
          onNewAppointment={() => setCurrentView('planning')}
          onViewPlanning={() => setCurrentView('planning')}
        />;
    }
  };

  return (
    <SecretaryLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
    >
      {renderView()}
    </SecretaryLayout>
  );
}