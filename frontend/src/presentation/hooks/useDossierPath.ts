// frontend/src/presentation/hooks/useDossierPath.ts

import { useAuth }     from './useAuth';
import { useNavigate } from 'react-router-dom';

const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

export function useDossierPath() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const getDossierPath = (patientId: number): string => {
    if (user?.role && MEDICAL_ROLES.includes(user.role)) {
      return `/doctor/patients/${patientId}/dossier`;
    }
    return `/patients/${patientId}/dossier`;
  };

  // LEÇON : On passe `from` dans le state de navigation.
  // React Router préserve ce state quand on navigue.
  // Le sidebar le lit avec useLocation().state pour savoir
  // depuis quelle liste on vient — et surligne le bon sous-item.
  const navigateToDossier = (patientId: number, from: 'externes' | 'hospitalises') => {
    navigate(getDossierPath(patientId), { state: { from } });
  };

  return { getDossierPath, navigateToDossier };
}