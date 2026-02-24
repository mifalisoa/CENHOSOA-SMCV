import { useState, useEffect, useCallback } from 'react';
import { patientRepository } from '../../infrastructure/repositories/PatientRepository';
import type { Patient, CreatePatientDTO } from '../../core/entities/Patient';

export function usePatients(type?: 'externe' | 'hospitalise') {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Helper pour extraire le message d'erreur proprement sans utiliser "any"
  const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { error?: string } } };
    return error.response?.data?.error || 'Une erreur est survenue';
  };

  const fetchPatients = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (type === 'externe') {
        result = await patientRepository.getExternes(currentPage, 10);
      } else if (type === 'hospitalise') {
        result = await patientRepository.getHospitalises(currentPage, 10);
      } else {
        result = await patientRepository.getAll(currentPage, 10);
      }
      
      setPatients(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      console.error('❌ [usePatients] Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const getPatientById = useCallback(async (id: number): Promise<Patient> => {
    try {
      setLoading(true);
      setError(null);
      const patient = await patientRepository.getById(id);
      return patient;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (data: CreatePatientDTO): Promise<Patient> => {
    try {
      const patient = await patientRepository.create(data);
      await fetchPatients(page);
      return patient;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchPatients, page]);

  const updatePatient = useCallback(async (id: number, data: Partial<CreatePatientDTO>) => {
    try {
      await patientRepository.update(id, data);
      await fetchPatients(page);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchPatients, page]);

  const deletePatient = useCallback(async (id: number) => {
    try {
      await patientRepository.delete(id);
      await fetchPatients(page);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchPatients, page]);

  const searchPatients = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const results = await patientRepository.search(query);
      setPatients(results);
    } catch (err: unknown) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Correction de l'avertissement exhaustive-deps
  useEffect(() => {
    fetchPatients(page);
  }, [type, page, fetchPatients]); 

  return {
    patients,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    refetch: () => fetchPatients(page),
  };
}