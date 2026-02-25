import { useState } from 'react';
import { useDocumentsPatient } from '../../../hooks/useDocumentsPatient';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateDocumentPatientDTO } from '../../../../core/entities/DocumentPatient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, File, Image as ImageIcon, Video, Calendar, Archive, User, Eye, Download, Trash2 } from 'lucide-react';
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
        return <File className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />;
      case 'image':
      case 'jpg':
      case 'png':
        return <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />;
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Documents <span className="text-gray-500">({documents.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter un document</span>
          <span className="sm:hidden">Ajouter</span>
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-4">Aucun document ajouté au dossier</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md text-sm"
          >
            Ajouter le premier document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all group relative"
            >
              {/* Icône et Badge Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.type_fichier)}
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
                  aria-label="Supprimer le document"
                >
                  <Trash2 className="w-4 h-4" />
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
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{format(new Date(doc.date_ajout), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Archive className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{formatFileSize(doc.taille_fichier)}</span>
                </div>
                {doc.ajoute_par && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{doc.ajoute_par}</span>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <a
                  href={doc.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all text-center shadow-sm flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Ouvrir
                </a>
                <a
                  href={doc.url_fichier}
                  download={doc.nom_fichier}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Télécharger"
                  aria-label="Télécharger le document"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}