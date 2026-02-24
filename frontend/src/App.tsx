import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './presentation/store/AuthContext';
import { ProtectedRoute } from './presentation/pages/auth/ProtectedRoute';
import LoginPage from './presentation/pages/auth/LoginPage';
import AdminLayout from './presentation/components/layout/AdminLayout';
import DashboardHome from './presentation/pages/dashboard/sections/admin/DashboardHome';
import PatientsExternesView from './presentation/pages/dashboard/sections/admin/PatientsExternesView';
import PatientDossierPage from './presentation/pages/patients/PatientDossierPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées avec AdminLayout */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/patients-externes" element={<PatientsExternesView />} />
            <Route path="/patients-hospitalises" element={<div className="p-8">Patients hospitalisés</div>} />
            <Route path="/users" element={<div className="p-8">Utilisateurs</div>} />
            <Route path="/beds" element={<div className="p-8">Lits</div>} />
            <Route path="/statistics" element={<div className="p-8">Statistiques</div>} />
            <Route path="/security" element={<div className="p-8">Sécurité</div>} />
            <Route path="/appointments" element={<div className="p-8">Planning</div>} />
            <Route path="/patients/:id/dossier" element={<PatientDossierPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster position="top-right" richColors closeButton duration={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;