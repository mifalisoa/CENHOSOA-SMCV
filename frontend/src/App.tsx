import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './presentation/store/AuthContext';
import { ProtectedRoute } from './presentation/pages/auth/ProtectedRoute';
import LoginPage from './presentation/pages/auth/LoginPage';
import AdminLayout from './presentation/components/layout/AdminLayout';
import DashboardHome from './presentation/pages/dashboard/sections/admin/DashboardHome';
import PatientsExternesView from './presentation/pages/dashboard/sections/admin/PatientsExternesView';
import PatientDossierPage from './presentation/pages/patients/PatientDossierPage';
import PatientsHospitalises from './presentation/pages/dashboard/sections/admin/PatientsHospitalises';
import LitsPage from './presentation/pages/lits/LitsPage';
import PlanningPage from './presentation/pages/rendez-vous/PlanningPage';
import StatistiquesPage from './presentation/pages/StatistiquesPage';
import UtilisateursPage from './presentation/pages/utilisateurs/UtilisateursPage';
import DashboardSecuritePage from './presentation/pages/securite/DashboardSecuritePage';


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
            <Route path="/patients-hospitalises" element={<PatientsHospitalises />} />
            <Route path="/users" element={<UtilisateursPage />} />
            <Route path="/utilisateurs" element={<UtilisateursPage />} />
            <Route path="/beds" element={<LitsPage />} />
            <Route path="/statistics" element={<StatistiquesPage />} />
            <Route path="/statistiques" element={<StatistiquesPage />} />
            <Route path="/security" element={<DashboardSecuritePage/>} />
            <Route path="/securite" element={<DashboardSecuritePage />} />
            <Route path="/securite/dashboard" element={<DashboardSecuritePage />} />
            <Route path="/appointments" element={<PlanningPage />} />
            <Route path="/planning" element={<PlanningPage />} />
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