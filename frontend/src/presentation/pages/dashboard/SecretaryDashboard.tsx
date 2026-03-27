// frontend/src/presentation/pages/dashboard/SecretaryDashboard.tsx
//
// LEÇON : Le secrétaire n'a pas besoin de React Router pour sa navigation
// interne — son périmètre est simple et auto-contenu.
// On garde l'état `currentView` mais on le gère proprement dans un seul
// composant racine, sans le dupliquer dans le layout.

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SecretaryLayout } from '../../components/layout/SecretaryLayout';
import SecretaryDashboardHome from './sections/SecretaryDashboardHome';
import PlanningPage from '../rendez-vous/PlanningPage';
import PatientsExternesView from './sections/admin/PatientsExternesView';
import PatientsHospitalises from './sections/admin/PatientsHospitalises';

// Type union explicite — toutes les vues possibles du secrétaire
// LEÇON : Toujours typer les vues avec un type union plutôt que `string`
// Avantage : TypeScript te prévient si tu oublies un case dans le switch
type SecretaryView =
  | 'dashboard'
  | 'planning'
  | 'patients-externes'
  | 'patients-hospitalises';

export default function SecretaryDashboard() {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<SecretaryView>('dashboard');

  // LEÇON : `renderView` est une fonction pure — elle prend un état
  // et retourne un composant. Facile à tester, facile à lire.
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <SecretaryDashboardHome
            onGoToPlanning={() => setCurrentView('planning')}
          />
        );
      case 'planning':
        return <PlanningPage />;
      case 'patients-externes':
        // LEÇON : `key` force le remontage quand on change de vue
        // → les états internes (filtres, page) sont réinitialisés proprement
        return <PatientsExternesView key="externes" />;
      case 'patients-hospitalises':
        return <PatientsHospitalises key="hospitalises" />;
      default:
        return <SecretaryDashboardHome onGoToPlanning={() => setCurrentView('planning')} />;
    }
  };

  return (
    <SecretaryLayout
      currentView={currentView}
      onViewChange={(view) => setCurrentView(view as SecretaryView)}
      onLogout={logout}
    >
      {renderView()}
    </SecretaryLayout>
  );
}