import { useState, useEffect, useCallback } from 'react';
import { patientRepository } from '../../infrastructure/repositories/PatientRepository';
import type { Patient, CreatePatientDTO, PaginatedPatients } from '../../core/entities/Patient';

export function usePatients(type?: 'externe' | 'hospitalise') {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (type === 'externe') {
        result = await patientRepository.getExternes(page, 10);
      } else if (type === 'hospitalise') {
        result = await patientRepository.getHospitalises(page, 10);
      } else {
        result = await patientRepository.getAll(page, 10);
      }
      
      setPatients(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erreur lors du chargement des patients';
      setError(message);
      console.error('❌ [usePatients] Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  // ✅ AJOUT : Fonction pour récupérer un patient par ID
  const getPatientById = async (id: number): Promise<Patient> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 [Hook] Chargement patient ID:', id);
      
      const patient = await patientRepository.getById(id);
      console.log('✅ [Hook] Patient chargé:', patient);
      
      return patient;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erreur lors du chargement du patient';
      setError(message);
      console.error('❌ [Hook] Erreur getPatientById:', err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (data: CreatePatientDTO): Promise<Patient> => {
    try {
      console.log('🔵 [Hook] Création patient:', data);
      const patient = await patientRepository.create(data);
      console.log('✅ [Hook] Patient créé:', patient);
      
      await fetchPatients(); // Rafraîchir la liste
      return patient;
    } catch (err: any) {
      console.error('❌ [Hook] Erreur création:', err);
      const message = err.response?.data?.error || 'Erreur lors de la création du patient';
      throw new Error(message);
    }
  };

  const updatePatient = async (id: number, data: Partial<CreatePatientDTO>) => {
    try {
      await patientRepository.update(id, data);
      await fetchPatients();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erreur lors de la mise à jour';
      throw new Error(message);
    }
  };

  const deletePatient = async (id: number) => {
    try {
      await patientRepository.delete(id);
      await fetchPatients();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erreur lors de la suppression';
      throw new Error(message);
    }
  };

  const searchPatients = async (query: string) => {
    try {
      setLoading(true);
      const results = await patientRepository.search(query);
      setPatients(results);
    } catch (err: any) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    getPatientById, // ✅ EXPORT de la nouvelle fonction
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    refetch: fetchPatients,
  };
}
