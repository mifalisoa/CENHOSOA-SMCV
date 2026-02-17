import { useState, useEffect, useCallback } from 'react';
import { CompteRenduRepository } from '../../infrastructure/repositories/CompteRenduRepository';
import type { CompteRendu, CreateCompteRenduDTO } from '../../core/entities/CompteRendu';

const compteRenduRepository = new CompteRenduRepository();

export const useComptesRendus = (patientId?: number) => {
  const [comptesRendus, setComptesRendus] = useState<CompteRendu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComptesRendus = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await compteRenduRepository.getByPatientId(patientId);
      setComptesRendus(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des comptes rendus';
      setError(errorMessage);
      console.error('Erreur fetchComptesRendus:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createCompteRendu = async (data: CreateCompteRenduDTO): Promise<CompteRendu | null> => {
    setLoading(true);
    setError(null);
    try {
      const newCompteRendu = await compteRenduRepository.create(data);
      setComptesRendus(prev => [newCompteRendu, ...prev]);
      return newCompteRendu;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du compte rendu';
      setError(errorMessage);
      console.error('Erreur createCompteRendu:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCompteRendu = async (id: number, data: Partial<CreateCompteRenduDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await compteRenduRepository.update(id, data);
      setComptesRendus(prev => prev.map(cr => cr.id_compte_rendu === id ? updated : cr));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Erreur updateCompteRendu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompteRendu = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await compteRenduRepository.delete(id);
      setComptesRendus(prev => prev.filter(cr => cr.id_compte_rendu !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteCompteRendu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComptesRendus();
  }, [fetchComptesRendus]);

  return {
    comptesRendus,
    loading,
    error,
    refreshComptesRendus: fetchComptesRendus,
    createCompteRendu,
    updateCompteRendu,
    deleteCompteRendu,
  };
};