import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // si fourni, vérifie le rôle en plus de l'authentification
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont requis, vérifier que l'utilisateur a le bon rôle
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      // Rediriger vers le bon dashboard selon le rôle réel
      switch (user.role) {
        case 'medecin':    return <Navigate to="/doctor"    replace />;
        case 'secretaire': return <Navigate to="/secretary" replace />;
        default:           return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
}