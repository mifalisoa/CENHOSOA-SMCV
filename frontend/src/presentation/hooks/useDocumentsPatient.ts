import { useState, useEffect, useCallback } from 'react';
import { DocumentPatientRepository } from '../../infrastructure/repositories/DocumentPatientRepository';
import type { DocumentPatient, CreateDocumentPatientDTO } from '../../core/entities/DocumentPatient';

const documentRepository = new DocumentPatientRepository();

export const useDocumentsPatient = (patientId?: number) => {
  const [documents, setDocuments] = useState<DocumentPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await documentRepository.getByPatientId(patientId);
      setDocuments(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      console.error('Erreur fetchDocuments:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createDocument = async (data: CreateDocumentPatientDTO): Promise<DocumentPatient | null> => {
    setLoading(true);
    setError(null);
    try {
      const newDocument = await documentRepository.create(data);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout du document";
      setError(errorMessage);
      console.error('Erreur createDocument:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await documentRepository.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id_document !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur deleteDocument:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refreshDocuments: fetchDocuments,
    createDocument,
    deleteDocument,
  };
};