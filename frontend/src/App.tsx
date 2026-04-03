// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }       from 'sonner';
import { AuthProvider }  from './presentation/store/AuthContext';
import { ProtectedRoute } from './presentation/pages/auth/ProtectedRoute';
import { useAuth }       from './presentation/hooks/useAuth';
import { useEffect, useState } from 'react';
import axios             from 'axios';
import type { UserRole } from './core/entities/User';

// Auth pages
import LoginPage            from './presentation/pages/auth/LoginPage';
import SetupPage            from './presentation/pages/auth/SetupPage';
import ChangerMotDePassePage from './presentation/pages/auth/ChangerMotDePassePage';
import ForgotPasswordPage   from './presentation/pages/auth/ForgotPasswordPage';
import ResetPasswordPage    from './presentation/pages/auth/ResetPasswordPage';

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

// Docteur
import { DoctorLayout }    from './presentation/components/layout/DoctorLayout';
import DoctorDashboardHome from './presentation/pages/dashboard/sections/DoctorDashboardHome';
import PatientsPage        from './presentation/pages/patients/PatientsPage';

// Secrétaire
import SecretaryDashboard from './presentation/pages/dashboard/SecretaryDashboard';

const MEDICAL_ROLES: UserRole[] = ['medecin', 'interne', 'stagiaire', 'infirmier'];

const ROLE_DISPLAY_LABELS: Record<string, 'docteur' | 'interne' | 'stagiaire'> = {
  medecin: 'docteur', interne: 'interne', stagiaire: 'stagiaire', infirmier: 'docteur',
};

// ── Vérification setup au démarrage ──────────────────────────────────────────

function SetupGuard({ children }: { children: React.ReactNode }) {
  const [setupDone, setSetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/setup/status`)
      .then(res => setSetupDone(res.data.data.setup_done))
      .catch(() => setSetupDone(true)); // En cas d'erreur, on laisse passer
  }, []);

  if (setupDone === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!setupDone) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

// ── Redirection selon le rôle ─────────────────────────────────────────────────

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.premier_connexion) return <Navigate to="/changer-mot-de-passe" replace />;
  if (MEDICAL_ROLES.includes(user.role)) return <Navigate to="/doctor"    replace />;
  if (user.role === 'secretaire')        return <Navigate to="/secretary" replace />;
  return <Navigate to="/dashboard" replace />;
}

function DoctorLayoutWrapper() {
  const { user } = useAuth();
  const displayRole = ROLE_DISPLAY_LABELS[user?.role ?? 'medecin'] ?? 'docteur';
  const realRole    = user?.role ?? 'medecin';
  return <DoctorLayout onLogout={() => {}} userRole={displayRole} sidebarRole={realRole} />;
}

function RequirePasswordChanged({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.premier_connexion) return <Navigate to="/changer-mot-de-passe" replace />;
  return <>{children}</>;
}

// ── Routes ────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Setup initial — accessible uniquement si setup pas fait */}
      <Route path="/setup" element={<SetupPage />} />

      {/* Reset mot de passe — public */}
      <Route path="/mot-de-passe-oublie"     element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />

      {/* Login */}
      <Route path="/login" element={<SetupGuard><LoginPage /></SetupGuard>} />

      {/* Racine */}
      <Route path="/" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />

      {/* Changement mot de passe obligatoire */}
      <Route path="/changer-mot-de-passe"
        element={<ProtectedRoute><ChangerMotDePassePage /></ProtectedRoute>}
      />

      {/* ── ADMIN ── */}
      <Route element={
        <ProtectedRoute roles={['admin']}>
          <RequirePasswordChanged><AdminLayout /></RequirePasswordChanged>
        </ProtectedRoute>
      }>
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
      <Route element={
        <ProtectedRoute roles={MEDICAL_ROLES}>
          <RequirePasswordChanged><DoctorLayoutWrapper /></RequirePasswordChanged>
        </ProtectedRoute>
      }>
        <Route path="/doctor"                       element={<DoctorDashboardHome />} />
        <Route path="/doctor/patients-externes"     element={<PatientsPage key="externes"     defaultTab="externes"    />} />
        <Route path="/doctor/patients-hospitalises" element={<PatientsPage key="hospitalises" defaultTab="hospitalises" />} />
        <Route path="/doctor/planning"              element={<PlanningPage />} />
        <Route path="/doctor/patients/:id/dossier"  element={<PatientDossierPage />} />
      </Route>

      {/* ── SECRÉTAIRE ── */}
      <Route path="/secretary/*"
        element={
          <ProtectedRoute roles={['secretaire']}>
            <RequirePasswordChanged><SecretaryDashboard /></RequirePasswordChanged>
          </ProtectedRoute>
        }
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