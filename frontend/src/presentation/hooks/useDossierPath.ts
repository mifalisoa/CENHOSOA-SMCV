// frontend/src/presentation/hooks/useDossierPath.ts

import { useAuth } from './useAuth';

export function useDossierPath() {
  const { user } = useAuth();

  const getDossierPath = (patientId: number): string => {
    if (user?.role === 'medecin') {
      return `/doctor/patients/${patientId}/dossier`;
    }
    return `/patients/${patientId}/dossier`;
  };

  return { getDossierPath };
}