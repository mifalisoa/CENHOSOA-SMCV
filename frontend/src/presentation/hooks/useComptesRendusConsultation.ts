import { useState, useEffect, useCallback } from 'react';
import { compteRenduConsultationRepository } from '../../infrastructure/repositories/CompteRenduConsultationRepository';
import type { CompteRenduConsultation, CreateCompteRenduConsultationDTO } from '../../core/entities/CompteRenduConsultation';

export function useComptesRendusConsultation(patientId: number) {
  const [comptesRendus, setComptesRendus] = useState<CompteRenduConsultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { message?: string } } };
    return error.response?.data?.message || 'Une erreur est survenue';
  };

  const fetchComptesRendus = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await compteRenduConsultationRepository.getByPatientId(patientId);
      setComptesRendus(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createCompteRendu = useCallback(async (data: CreateCompteRenduConsultationDTO) => {
    try {
      const compteRendu = await compteRenduConsultationRepository.create(data);
      await fetchComptesRendus();
      return compteRendu;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchComptesRendus]);

  useEffect(() => {
    fetchComptesRendus();
  }, [fetchComptesRendus]);

  return {
    comptesRendus,
    loading,
    error,
    createCompteRendu,
    refetch: fetchComptesRendus,
  };
}