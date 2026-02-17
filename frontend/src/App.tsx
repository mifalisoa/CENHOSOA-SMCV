import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './presentation/store/AuthContext';
import { ProtectedRoute } from './presentation/pages/auth/ProtectedRoute';
import LoginPage from './presentation/pages/auth/LoginPage';
import DashboardPage from './presentation/pages/dashboard/DashboardPage';
import PatientDossierPage from './presentation/pages/patients/PatientDossierPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Route publique - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Route protégée - Dashboard principal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirection de la racine vers le dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirection vers le dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/patients/:id/dossier" element={<PatientDossierPage />} />
        </Routes>
        
        {/* Notifications Toast globales */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={3000}
          toastOptions={{
            className: 'toaster-custom',
            style: {
              background: 'white',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;