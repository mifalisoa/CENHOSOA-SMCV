import { useState, useCallback } from 'react';

// Type temporaire pour les rendez-vous
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  room?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implémenter l'appel API réel
      // Pour l'instant, retourner un tableau vide
      setAppointments([]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    loadAppointments
  };
}