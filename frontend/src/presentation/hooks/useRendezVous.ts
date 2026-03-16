// frontend/src/presentation/hooks/useRendezVous.ts

import { useState, useCallback } from 'react';
import { rendezVousRepository } from '../../infrastructure/repositories/RendezVousRepository';
import type { 
  RendezVous, 
  CreateRendezVousDTO, 
  UpdateRendezVousDTO,
  RendezVousFilters 
} from '../../core/entities/RendezVous';
import { toast } from 'sonner';

export const useRendezVous = () => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer tous les rendez-vous avec filtres
   */
  const fetchRendezVous = useCallback(async (filters?: RendezVousFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rendezVousRepository.getAll(filters);
      setRendezVous(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des rendez-vous';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les rendez-vous d'une date
   */
  const fetchByDate = useCallback(async (date: string, docteurId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rendezVousRepository.getByDate(date, docteurId);
      setRendezVous(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les rendez-vous d'une période
   */
  const fetchByPeriod = useCallback(async (dateDebut: string, dateFin: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rendezVousRepository.getByPeriod(dateDebut, dateFin);
      setRendezVous(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer un rendez-vous par ID
   */
  const fetchById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rendezVousRepository.getById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un nouveau rendez-vous
   */
  const createRendezVous = useCallback(async (data: CreateRendezVousDTO) => {
    try {
      setLoading(true);
      setError(null);
      const newRdv = await rendezVousRepository.create(data);
      setRendezVous(prev => [...prev, newRdv]);
      toast.success('Rendez-vous créé avec succès');
      return newRdv;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour un rendez-vous
   */
  const updateRendezVous = useCallback(async (id: number, data: UpdateRendezVousDTO) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.update(id, data);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Rendez-vous mis à jour');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprimer un rendez-vous
   */
  const deleteRendezVous = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await rendezVousRepository.delete(id);
      setRendezVous(prev => prev.filter(rdv => rdv.id_rdv !== id));
      toast.success('Rendez-vous supprimé');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirmer un rendez-vous
   */
  const confirmRendezVous = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.confirm(id);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Rendez-vous confirmé');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la confirmation';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Annuler un rendez-vous
   */
  const cancelRendezVous = useCallback(async (id: number, raison: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.cancel(id, raison);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Rendez-vous annulé');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marquer comme terminé
   */
  const completeRendezVous = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.complete(id);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Rendez-vous marqué comme terminé');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marquer comme absent
   */
  const markAbsent = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.markAbsent(id);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Patient marqué comme absent');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reporter un rendez-vous
   */
  const rescheduleRendezVous = useCallback(async (id: number, nouvelleDate: string, nouvelleHeure: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await rendezVousRepository.reschedule(id, nouvelleDate, nouvelleHeure);
      setRendezVous(prev => prev.map(rdv => rdv.id_rdv === id ? updated : rdv));
      toast.success('Rendez-vous reporté');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du report';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer les créneaux disponibles
   */
  const getAvailableSlots = useCallback(async (
    docteurId: number,
    date: string,
    heureDebut?: string,
    heureFin?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const slots = await rendezVousRepository.getAvailableSlots(docteurId, date, heureDebut, heureFin);
      return slots;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des créneaux';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rendezVous,
    loading,
    error,
    fetchRendezVous,
    fetchByDate,
    fetchByPeriod,
    fetchById,
    createRendezVous,
    updateRendezVous,
    deleteRendezVous,
    confirmRendezVous,
    cancelRendezVous,
    completeRendezVous,
    markAbsent,
    rescheduleRendezVous,
    getAvailableSlots
  };
};