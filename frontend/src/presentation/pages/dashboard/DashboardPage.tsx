import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import SecretaryDashboard from './SecretaryDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement du profil utilisateur...</p>
      </div>
    );
  }

  // Router selon le rôle
  switch (user.role_user) {
    case 'admin':
      return <AdminDashboard />;
    
    case 'docteur':
      return <DoctorDashboard userRole="docteur" />;
    
    case 'secretaire':
      return <SecretaryDashboard />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Rôle non reconnu: {user.role_user}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      );
  }
}