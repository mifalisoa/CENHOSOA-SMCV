// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider }    from './presentation/store/AuthContext';
import { ProtectedRoute }  from './presentation/pages/auth/ProtectedRoute';
import { useAuth }         from './presentation/hooks/useAuth';
import LoginPage           from './presentation/pages/auth/LoginPage';
import type { UserRole }   from './core/entities/User';

// Admin
import AdminLayout           from './presentation/components/layout/AdminLayout';
import DashboardHome         from './presentation/pages/dashboard/sections/admin/DashboardHome';
import PatientsExternesView  from './presentation/pages/dashboard/sections/admin/PatientsExternesView';
import PatientsHospitalises  from './presentation/pages/dashboard/sections/admin/PatientsHospitalises';
import LitsPage              from './presentation/pages/lits/LitsPage';
import StatistiquesPage      from './presentation/pages/StatistiquesPage';
import UtilisateursPage      from './presentation/pages/utilisateurs/UtilisateursPage';
import DashboardSecuritePage from './presentation/pages/securite/DashboardSecuritePage';

// Partagé
import PlanningPage       from './presentation/pages/rendez-vous/PlanningPage';
import PatientDossierPage from './presentation/pages/patients/PatientDossierPage';

// Docteur + rôles médicaux
import { DoctorLayout }    from './presentation/components/layout/DoctorLayout';
import DoctorDashboardHome from './presentation/pages/dashboard/sections/DoctorDashboardHome';
import PatientsPage        from './presentation/pages/patients/PatientsPage';

// Secrétaire
import SecretaryDashboard from './presentation/pages/dashboard/SecretaryDashboard';

// ── Rôles médicaux — tous redirigés vers /doctor ─────────────────────────────
const MEDICAL_ROLES: UserRole[] = ['medecin', 'interne', 'stagiaire', 'infirmier'];

// Mapping rôle → label affiché dans DoctorHeader
const ROLE_LABELS: Record<string, 'docteur' | 'interne' | 'stagiaire'> = {
  medecin:   'docteur',
  interne:   'interne',
  stagiaire: 'stagiaire',
  infirmier: 'docteur',
};

// ── Redirection selon le rôle ────────────────────────────────────────────────

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (MEDICAL_ROLES.includes(user.role)) return <Navigate to="/doctor"    replace />;
  if (user.role === 'secretaire')        return <Navigate to="/secretary" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ── Wrapper qui adapte le userRole au rôle connecté ─────────────────────────

function DoctorLayoutWrapper() {
  const { user } = useAuth();
  const userRole = ROLE_LABELS[user?.role ?? 'medecin'] ?? 'docteur';
  // onLogout est géré en interne par useLogout dans DoctorLayout
  return <DoctorLayout onLogout={() => {}} userRole={userRole} />;
}

// ── Routes ───────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/"      element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />

      {/* ── ADMIN ── */}
      <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard"             element={<DashboardHome />} />
        <Route path="/patients-externes"     element={<PatientsExternesView />} />
        <Route path="/patients-hospitalises" element={<PatientsHospitalises />} />
        <Route path="/patients/:id/dossier"  element={<PatientDossierPage />} />
        <Route path="/planning"              element={<PlanningPage />} />
        <Route path="/beds"                  element={<LitsPage />} />
        <Route path="/utilisateurs"          element={<UtilisateursPage />} />
        <Route path="/statistiques"          element={<StatistiquesPage />} />
        <Route path="/securite"              element={<DashboardSecuritePage />} />
      </Route>

      {/* ── MÉDECIN / INTERNE / STAGIAIRE / INFIRMIER ── */}
      <Route element={<ProtectedRoute roles={MEDICAL_ROLES}><DoctorLayoutWrapper /></ProtectedRoute>}>
        <Route path="/doctor"                       element={<DoctorDashboardHome />} />
        <Route path="/doctor/patients-externes"     element={<PatientsPage key="externes"     defaultTab="externes"    />} />
        <Route path="/doctor/patients-hospitalises" element={<PatientsPage key="hospitalises" defaultTab="hospitalises" />} />
        <Route path="/doctor/planning"              element={<PlanningPage />} />
        <Route path="/doctor/patients/:id/dossier"  element={<PatientDossierPage />} />
      </Route>

      {/* ── SECRÉTAIRE ── */}
      <Route
        path="/secretary/*"
        element={<ProtectedRoute roles={['secretaire']}><SecretaryDashboard /></ProtectedRoute>}
      />

      {/* Fallback */}
      <Route path="*" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}