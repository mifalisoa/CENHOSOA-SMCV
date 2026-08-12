// frontend/src/presentation/hooks/usePiecesJointes.ts

import { useState, useEffect, useCallback } from 'react';
import { PieceJointeRepository } from '../../infrastructure/repositories/PieceJointeRepository';
import type { PieceJointe, CreatePieceJointeDTO, EntiteType } from '../../core/entities/PieceJointe';

const pieceJointeRepository = new PieceJointeRepository();

export const usePiecesJointes = (entiteType: EntiteType, entiteId?: number) => {
  const [piecesJointes, setPiecesJointes] = useState<PieceJointe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPiecesJointes = useCallback(async () => {
    if (!entiteId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await pieceJointeRepository.getByEntite(entiteType, entiteId);
      setPiecesJointes(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des pièces jointes';
      setError(errorMessage);
      console.error('Erreur fetchPiecesJointes:', err);
    } finally {
      setLoading(false);
    }
  }, [entiteType, entiteId]);

  const createPieceJointe = async (data: CreatePieceJointeDTO): Promise<PieceJointe | null> => {
    setLoading(true);
    setError(null);
    try {
      const newPieceJointe = await pieceJointeRepository.create(data);
      setPiecesJointes(prev => [newPieceJointe, ...prev]);
      return newPieceJointe;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout de la pièce jointe";
      setError(errorMessage);
      console.error('Erreur createPieceJointe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePieceJointe = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await pieceJointeRepository.delete(id);
      setPiecesJointes(prev => prev.filter(pj => pj.id_piece_jointe !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deletePieceJointe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiecesJointes();
  }, [fetchPiecesJointes]);

  return {
    piecesJointes,
    loading,
    error,
    refreshPiecesJointes: fetchPiecesJointes,
    createPieceJointe,
    deletePieceJointe,
  };
};