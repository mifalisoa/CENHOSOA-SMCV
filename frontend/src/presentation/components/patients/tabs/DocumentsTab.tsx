import { useDocumentsPatient } from '../../../hooks/useDocumentsPatient';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentsTabProps {
  patient: Patient;
}

export default function DocumentsTab({ patient }: DocumentsTabProps) {
  const { documents, loading, error, deleteDocument } = useDocumentsPatient(patient.id_patient);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          + Ajouter un document
        </button>
      </div>

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 font-medium">Aucun document ajouté au dossier</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group relative"
            >
              {/* Icône et Bouton Supprimer */}
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
                  onClick={() => {
                    if(window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
                      deleteDocument(doc.id_document);
                    }
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>

              {/* Contenu */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1" title={doc.titre}>
                  {doc.titre}
                </h4>
                {doc.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {doc.description}
                  </p>
                )}
              </div>

              {/* Métadonnées */}
              <div className="border-t border-gray-100 pt-3 mb-4 space-y-1 text-[11px] text-gray-400">
                <div className="flex items-center gap-1">
                  <span>📅</span> {format(new Date(doc.date_ajout), 'dd MMM yyyy', { locale: fr })}
                </div>
                <div className="flex items-center gap-1">
                  <span>📦</span> {formatFileSize(doc.taille_fichier)}
                </div>
                {doc.ajoute_par && (
                  <div className="flex items-center gap-1">
                    <span>👤</span> {doc.ajoute_par}
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <a
                  href={doc.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center shadow-sm"
                >
                  Ouvrir
                </a>
                <a
                  href={doc.url_fichier}
                  download={doc.nom_fichier}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  title="Télécharger"
                >
                  ⬇️
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}