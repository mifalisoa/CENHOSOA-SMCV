import { useState } from 'react';
import { useDocumentsPatient } from '../../../hooks/useDocumentsPatient';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateDocumentPatientDTO } from '../../../../core/entities/DocumentPatient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddDocumentModal from './AddDocumentModal';

interface DocumentsTabProps {
  patient: Patient;
}

export default function DocumentsTab({ patient }: DocumentsTabProps) {
  const { documents, loading, error, createDocument, deleteDocument } = useDocumentsPatient(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateDocument = async (data: CreateDocumentPatientDTO) => {
    await createDocument(data);
    setShowAddModal(false);
  };

  const handleDelete = async (id: number, titre: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer "${titre}" ?`)) {
      await deleteDocument(id);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'image':
      case 'jpg':
      case 'png':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && documents.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un document
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddDocumentModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateDocument}
        />
      )}

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun document ajouté au dossier</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Ajouter le premier document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group relative"
            >
              {/* Icône et Badge Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl" role="img" aria-label="file-icon">
                    {getFileIcon(doc.type_fichier)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    doc.type_fichier === 'pdf' ? 'bg-red-100 text-red-700' :
                    doc.type_fichier === 'image' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {doc.type_fichier}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(doc.id_document, doc.titre)}
                  disabled={loading}
                  className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 disabled:opacity-50"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Titre et Description */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1" title={doc.titre}>
                  {doc.titre}
                </h4>
                {doc.description ? (
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {doc.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic min-h-[32px]">
                    Aucune description
                  </p>
                )}
              </div>

              {/* Métadonnées */}
              <div className="border-t border-gray-100 pt-3 mb-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{format(new Date(doc.date_ajout), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span>{formatFileSize(doc.taille_fichier)}</span>
                </div>
                {doc.ajoute_par && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{doc.ajoute_par}</span>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <a
                  href={doc.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all text-center shadow-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ouvrir
                </a>
                <a
                  href={doc.url_fichier}
                  download={doc.nom_fichier}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Télécharger"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}