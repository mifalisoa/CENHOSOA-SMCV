// frontend/src/presentation/hooks/useLits.ts
//
// Version mise a jour : ajout de initialiserLits, necessaire pour brancher
// LitManagement.tsx qui appelait jusqu'ici httpClient directement.

import { useState, useEffect, useCallback } from 'react';
import { litRepository } from '../../infrastructure/repositories/LitRepository';
import type { LitWithOccupation, CreateLitDTO, UpdateLitDTO } from '../../core/entities/Lit';

export function useLits() {
  const [lits, setLits] = useState<LitWithOccupation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown): string => {
    const error = err as { response?: { data?: { error?: string } } };
    return error.response?.data?.error || 'Une erreur est survenue';
  };

  const fetchLits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await litRepository.getAll();
      setLits(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getLitById = useCallback(async (id: number) => {
    try {
      return await litRepository.getById(id);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const createLit = useCallback(async (data: CreateLitDTO) => {
    try {
      const lit = await litRepository.create(data);
      await fetchLits();
      return lit;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchLits]);

  const updateLit = useCallback(async (id: number, data: UpdateLitDTO) => {
    try {
      const lit = await litRepository.update(id, data);
      await fetchLits();
      return lit;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchLits]);

  const deleteLit = useCallback(async (id: number) => {
    try {
      await litRepository.delete(id);
      await fetchLits();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchLits]);

  const libererLit = useCallback(async (id: number) => {
    try {
      const lit = await litRepository.liberer(id);
      await fetchLits();
      return lit;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchLits]);

  // Nouveau : action d'amorcage (creation des 24 lits CENHOSOA par defaut).
  // Renvoie le message du backend tel quel, pour ne jamais desynchroniser
  // un texte affiche a l'utilisateur du nombre reel de lits crees cote serveur.
  const initialiserLits = useCallback(async () => {
    try {
      const result = await litRepository.initialiser();
      await fetchLits();
      return result;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  }, [fetchLits]);

  useEffect(() => {
    fetchLits();
  }, [fetchLits]);

  return {
    lits,
    loading,
    error,
    getLitById,
    createLit,
    updateLit,
    deleteLit,
    libererLit,
    initialiserLits,
    refetch: fetchLits,
  };
}