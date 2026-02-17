import { useState, useEffect, useCallback } from 'react';
import { TraitementRepository } from '../../infrastructure/repositories/TraitementRepository';
import type { Traitement, CreateTraitementDTO } from '../../core/entities/Traitement';

const traitementRepository = new TraitementRepository();

export const useTraitements = (patientId?: number) => {
  const [traitements, setTraitements] = useState<Traitement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTraitements = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await traitementRepository.getByPatientId(patientId);
      setTraitements(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des traitements';
      setError(errorMessage);
      console.error('Erreur fetchTraitements:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createTraitement = async (data: CreateTraitementDTO): Promise<Traitement | null> => {
    setLoading(true);
    setError(null);
    try {
      const newTraitement = await traitementRepository.create(data);
      setTraitements(prev => [newTraitement, ...prev]);
      return newTraitement;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du traitement';
      setError(errorMessage);
      console.error('Erreur createTraitement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTraitement = async (id: number, data: Partial<CreateTraitementDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await traitementRepository.update(id, data);
      setTraitements(prev => prev.map(t => t.id_traitement === id ? updated : t));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Erreur updateTraitement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTraitement = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await traitementRepository.delete(id);
      setTraitements(prev => prev.filter(t => t.id_traitement !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteTraitement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraitements();
  }, [fetchTraitements]);

  return {
    traitements,
    loading,
    error,
    refreshTraitements: fetchTraitements,
    createTraitement,
    updateTraitement,
    deleteTraitement,
  };
};