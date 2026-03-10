import { useState } from 'react';
import { useDocumentsPatient } from '../../../hooks/useDocumentsPatient';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateDocumentPatientDTO } from '../../../../core/entities/DocumentPatient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// Suppression de 'User' qui n'était pas utilisé
import { Plus, FileText, File, Image as ImageIcon, Video, Calendar, Archive, Eye, Download, Trash2, FileArchive } from 'lucide-react';
import AddDocumentModal from './AddDocumentModal';
import { ConfirmModal } from '../../common/ConfirmModal'; // Chemin corrigé
import { toast } from 'sonner';
import { httpClient } from '../../../../infrastructure/http/axios.config';

interface DocumentsTabProps {
  patient: Patient;
}

export default function DocumentsTab({ patient }: DocumentsTabProps) {
  // Retrait de 'error' car non utilisé dans le JSX
  const { documents, loading, createDocument, deleteDocument } = useDocumentsPatient(patient.id_patient);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: number | null; titre: string }>({
    isOpen: false,
    id: null,
    titre: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateDocument = async (data: CreateDocumentPatientDTO) => {
    await createDocument(data);
    setShowAddModal(false);
  };

  const openDeleteConfirm = (id: number, titre: string) => {
    setDeleteConfig({ isOpen: true, id, titre });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfig.id) return;

    setIsDeleting(true);
    try {
      await deleteDocument(deleteConfig.id);
      toast.success(`Le document "${deleteConfig.titre}" a été supprimé`);
      setDeleteConfig({ isOpen: false, id: null, titre: '' });
    } catch (err) {
      // On utilise 'err' dans le log pour satisfaire TypeScript ou on le préfixe par _
      console.error('Erreur suppression:', err);
      toast.error('Impossible de supprimer le document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadAllZIP = async () => {
    if (documents.length === 0) {
      toast.error('Aucun document à télécharger');
      return;
    }

    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/documents-patients/patient/${patient.id_patient}/zip`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Archive ZIP prête !`);
    } catch  { // Préfixe _ pour indiquer qu'on l'ignore volontairement
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <File className="w-8 h-8 text-red-500" />;
      case 'image':
      case 'jpg':
      case 'png': return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'video': return <Video className="w-8 h-8 text-purple-500" />;
      default: return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents <span className="text-gray-500 font-normal">({documents.length})</span>
        </h3>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {documents.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              title="Télécharger tous les documents en ZIP"
              className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingAll ? (
                <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileArchive className="w-4 h-4" />
              )}
              ZIP
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-[2] sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Grid des documents */}
      {documents.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun document dans le dossier patient.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group border-l-4 border-l-blue-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.type_fichier)}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{doc.titre}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{doc.type_fichier}</span>
                  </div>
                </div>
                {/* Correction Accessibilité : Ajout de title */}
                <button
                  onClick={() => openDeleteConfirm(doc.id_document, doc.titre)}
                  title="Supprimer ce document"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8 italic">
                {doc.description || "Pas de description"}
              </p>

              <div className="bg-gray-50 rounded-lg p-2 mb-4 space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(doc.date_ajout), 'dd MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Archive className="w-3 h-3" />
                  {formatFileSize(doc.taille_fichier)}
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <a
                  href={doc.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visualiser le document"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Voir
                </a>
                {/* Correction Accessibilité : Ajout de title */}
                <a
                  href={doc.url_fichier}
                  download={doc.nom_fichier}
                  title="Télécharger le document"
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALES */}
      <ConfirmModal
        isOpen={deleteConfig.isOpen}
        title="Supprimer le document"
        message={`Attention : vous êtes sur le point de supprimer "${deleteConfig.titre}".`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
        isLoading={isDeleting}
      />

      {showAddModal && (
        <AddDocumentModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateDocument}
        />
      )}
    </div>
  );
}