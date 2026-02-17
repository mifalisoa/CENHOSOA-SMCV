import { useState, useEffect, useCallback } from 'react';
import { SoinInfirmierRepository } from '../../infrastructure/repositories/SoinInfirmierRepository';
import type { SoinInfirmier, CreateSoinInfirmierDTO } from '../../core/entities/SoinInfirmier';

const soinRepository = new SoinInfirmierRepository();

export const useSoinsInfirmiers = (patientId?: number) => {
  const [soins, setSoins] = useState<SoinInfirmier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoins = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await soinRepository.getByPatientId(patientId);
      setSoins(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des soins';
      setError(errorMessage);
      console.error('Erreur fetchSoins:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createSoin = async (data: CreateSoinInfirmierDTO): Promise<SoinInfirmier | null> => {
    setLoading(true);
    setError(null);
    try {
      const newSoin = await soinRepository.create(data);
      setSoins(prev => [newSoin, ...prev]);
      return newSoin;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du soin';
      setError(errorMessage);
      console.error('Erreur createSoin:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifySoin = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await soinRepository.verify(id);
      setSoins(prev => prev.map(soin => soin.id_soin_infirmier === id ? updated : soin));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      console.error('Erreur verifySoin:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSoin = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await soinRepository.delete(id);
      setSoins(prev => prev.filter(soin => soin.id_soin_infirmier !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteSoin:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoins();
  }, [fetchSoins]);

  return {
    soins,
    loading,
    error,
    refreshSoins: fetchSoins,
    createSoin,
    verifySoin,
    deleteSoin,
  };
};