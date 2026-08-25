import { useState, useEffect, useCallback } from 'react';
import { admissionRepository } from '../../infrastructure/repositories/AdmissionRepository';
import type { Admission, CreateAdmissionDTO } from '../../core/entities/Admission';

export function useAdmissions(filterEnCours = false) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { error?: string } } };
    return error.response?.data?.error || 'Une erreur est survenue';
  };

  const fetchAdmissions = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      if (filterEnCours) {
        const result = await admissionRepository.getEnCours();
        setAdmissions(result);
        setTotalPages(1);
        setTotal(result.length);
      } else {
        const result = await admissionRepository.getAll(currentPage, 10);
        setAdmissions(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filterEnCours]);

  const getAdmissionById = useCallback(async (id: number): Promise<Admission> => {
    try {
      return await admissionRepository.getById(id);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const createAdmission = useCallback(async (data: CreateAdmissionDTO): Promise<Admission> => {
    try {
      const admission = await admissionRepository.create(data);
      await fetchAdmissions(page);
      return admission;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchAdmissions, page]);

  const assignLit = useCallback(async (id: number, idLit: number) => {
    try {
      await admissionRepository.assignLit(id, idLit);
      await fetchAdmissions(page);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchAdmissions, page]);

  const cloturerAdmission = useCallback(async (id: number) => {
    try {
      await admissionRepository.cloturer(id);
      await fetchAdmissions(page);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchAdmissions, page]);

  useEffect(() => {
    fetchAdmissions(page);
  }, [page, fetchAdmissions]);

  return {
    admissions,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    getAdmissionById,
    createAdmission,
    assignLit,
    cloturerAdmission,
    refetch: () => fetchAdmissions(page),
  };
}