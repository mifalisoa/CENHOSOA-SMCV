import { useState, useEffect, useCallback } from 'react';
import { BilanBiologiqueRepository } from '../../infrastructure/repositories/BilanBiologiqueRepository';
import type { BilanBiologique, CreateBilanBiologiqueDTO } from '../../core/entities/BilanBiologique';

const bilanRepository = new BilanBiologiqueRepository();

export const useBilansBiologiques = (patientId?: number) => {
  const [bilans, setBilans] = useState<BilanBiologique[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBilans = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await bilanRepository.getByPatientId(patientId);
      setBilans(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des bilans';
      setError(errorMessage);
      console.error('Erreur fetchBilans:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createBilan = async (data: CreateBilanBiologiqueDTO): Promise<BilanBiologique | null> => {
    setLoading(true);
    setError(null);
    try {
      const newBilan = await bilanRepository.create(data);
      setBilans(prev => [newBilan, ...prev]);
      return newBilan;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du bilan';
      setError(errorMessage);
      console.error('Erreur createBilan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBilan = async (id: number, data: Partial<CreateBilanBiologiqueDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await bilanRepository.update(id, data);
      setBilans(prev => prev.map(bilan => bilan.id_bilan === id ? updated : bilan));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Erreur updateBilan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBilan = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await bilanRepository.delete(id);
      setBilans(prev => prev.filter(bilan => bilan.id_bilan !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteBilan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilans();
  }, [fetchBilans]);

  return {
    bilans,
    loading,
    error,
    refreshBilans: fetchBilans,
    createBilan,
    updateBilan,
    deleteBilan,
  };
};