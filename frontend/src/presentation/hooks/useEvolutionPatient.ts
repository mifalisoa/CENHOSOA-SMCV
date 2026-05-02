import { useState, useEffect, useCallback } from 'react';
import { EvolutionPatientRepository } from '../../infrastructure/repositories/EvolutionPatientRepository';
import type { EvolutionPatient, CreateEvolutionPatientDTO } from '../../core/entities/EvolutionPatient';

const evolutionRepository = new EvolutionPatientRepository();

export const useEvolutionPatient = (patientId?: number) => {
  const [evolutions, setEvolutions] = useState<EvolutionPatient[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fetchEvolutions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await evolutionRepository.getByPatientId(patientId);
      setEvolutions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des évolutions');
      console.error('Erreur fetchEvolutions:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createEvolution = async (data: CreateEvolutionPatientDTO): Promise<EvolutionPatient | null> => {
    setLoading(true);
    setError(null);
    try {
      const newEvolution = await evolutionRepository.create(data);
      setEvolutions(prev => [newEvolution, ...prev]);
      return newEvolution;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      console.error('Erreur createEvolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvolution = async (id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await evolutionRepository.update(id, data);
      setEvolutions(prev => prev.map(e => e.id_evolution === id ? updated : e));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Erreur updateEvolution:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvolution = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await evolutionRepository.delete(id);
      setEvolutions(prev => prev.filter(e => e.id_evolution !== id));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Erreur deleteEvolution:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolutions();
  }, [fetchEvolutions]);

  return {
    evolutions,
    loading,
    error,
    refreshEvolutions: fetchEvolutions,
    createEvolution,
    updateEvolution,
    deleteEvolution,
  };
};