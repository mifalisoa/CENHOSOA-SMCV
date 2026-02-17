import { useState, useEffect, useCallback } from 'react';
import { ObservationRepository } from '../../infrastructure/repositories/ObservationRepository';
import type { Observation, CreateObservationDTO } from '../../core/entities/Observation';

const observationRepository = new ObservationRepository();

export const useObservations = (patientId?: number, type?: 'externe' | 'hospitalise') => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObservations = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await observationRepository.getByPatientId(patientId, type);
      setObservations(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des observations';
      setError(errorMessage);
      console.error('Erreur fetchObservations:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, type]);

  const createObservation = async (data: CreateObservationDTO): Promise<Observation | null> => {
    setLoading(true);
    setError(null);
    try {
      const newObservation = await observationRepository.create(data);
      setObservations(prev => [newObservation, ...prev]);
      return newObservation;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de l'observation";
      setError(errorMessage);
      console.error('Erreur createObservation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateObservation = async (id: number, data: Partial<CreateObservationDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await observationRepository.update(id, data);
      setObservations(prev => prev.map(obs => obs.id_observation === id ? updated : obs));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Erreur updateObservation:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteObservation = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await observationRepository.delete(id);
      setObservations(prev => prev.filter(obs => obs.id_observation !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteObservation:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  return {
    observations,
    loading,
    error,
    refreshObservations: fetchObservations,
    createObservation,
    updateObservation,
    deleteObservation,
  };
};