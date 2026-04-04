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
    if (user?.role === 'secretaire') {
      return `/secretary/patients/${patientId}/dossier`;
    }
    return `/patients/${patientId}/dossier`;
  };

  const navigateToDossier = (patientId: number, from: 'externes' | 'hospitalises') => {
    navigate(getDossierPath(patientId), { state: { from } });
  };

  return { getDossierPath, navigateToDossier };
}