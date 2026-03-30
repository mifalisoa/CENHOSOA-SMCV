import { Navigate } from 'react-router-dom';
import { useAuth }   from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?:   string[];
}

// Rôles qui utilisent le dashboard médecin
const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

function getRoleRedirect(role: string): string {
  if (MEDICAL_ROLES.includes(role)) return '/doctor';
  if (role === 'secretaire')        return '/secretary';
  return '/dashboard';
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, user } = useAuth();

  // ✅ isInitializing au lieu de isLoading — attend la vérification du token
  if (isInitializing) {
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

  // ✅ Vérifie le rôle — gère tous les rôles médicaux correctement
  if (roles && roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to={getRoleRedirect(user.role)} replace />;
  }

  return <>{children}</>;
}