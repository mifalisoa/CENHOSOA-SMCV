import { useState } from 'react';
import { useDocumentsPatient } from '../../../hooks/useDocumentsPatient';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateDocumentPatientDTO } from '../../../../core/entities/DocumentPatient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, FileText, File, Image as ImageIcon, Video, Calendar, Archive, Eye, Download, Trash2, FileArchive } from 'lucide-react';
import AddDocumentModal from './AddDocumentModal';
import { ConfirmModal } from '../../common/ConfirmModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { toast } from 'sonner';
import { httpClient } from '../../../../infrastructure/http/axios.config';

interface DocumentsTabProps {
  patient: Patient;
}

export default function DocumentsTab({ patient }: DocumentsTabProps) {
  const { documents, loading, createDocument, deleteDocument } = useDocumentsPatient(patient.id_patient);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [deleteConfig,   setDeleteConfig]   = useState<{ isOpen: boolean; id: number | null; titre: string }>({
    isOpen: false, id: null, titre: '',
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
      console.error('Erreur suppression:', err);
      toast.error('Impossible de supprimer le document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadAllZIP = async () => {
    if (documents.length === 0) { toast.error('Aucun document à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/documents-patients/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documents_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archive ZIP prête !');
    } catch {
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Icône selon le type de fichier — toutes en gris neutre
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':                    return <File      className="w-8 h-8 text-gray-500" />;
      case 'image': case 'jpg':
      case 'png':   case 'jpeg':    return <ImageIcon className="w-8 h-8 text-gray-500" />;
      case 'video': case 'mp4':     return <Video     className="w-8 h-8 text-gray-500" />;
      default:                       return <FileText  className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── Chargement ────────────────────────────────────────────────────────────────

  if (loading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des documents...</p>
      </div>
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {documents.length === 0
              ? 'Aucun document dans le dossier'
              : `${documents.length} document${documents.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* ZIP — visible pour tous */}
          {documents.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              title="Télécharger tous les documents en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingAll
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FileArchive className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Tout (ZIP)</span>
              <span className="sm:hidden">ZIP</span>
            </button>
          )}

          {/* ✅ Ajouter — uniquement si permission write */}
          <PermissionGuard permission="documents.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-[2] sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── État vide ── */}
      {documents.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun document</h4>
          <p className="text-xs text-gray-500 mb-5">Les fichiers ajoutés au dossier patient apparaîtront ici.</p>
          {/* ✅ Ajouter le premier — uniquement si permission write */}
          <PermissionGuard permission="documents.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter le premier document
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex flex-col border-l-4 border-l-cyan-500"
            >
              {/* ── En-tête carte ── */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icône dans un conteneur gris neutre */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    {getFileIcon(doc.type_fichier)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{doc.titre}</h4>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{doc.type_fichier}</span>
                  </div>
                </div>

                {/* ✅ Supprimer — uniquement si permission write */}
                <PermissionGuard permission="documents.write">
                  <button
                    onClick={() => openDeleteConfirm(doc.id_document, doc.titre)}
                    title="Supprimer ce document"
                    className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </PermissionGuard>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-3 line-clamp-2 italic leading-relaxed">
                {doc.description || 'Pas de description'}
              </p>

              {/* Métadonnées */}
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                  {format(new Date(doc.date_ajout), 'dd MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Archive className="w-3 h-3 text-gray-400 shrink-0" />
                  {formatFileSize(doc.taille_fichier)}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-2 mt-auto">
                {/* Voir — cyan principal */}
                <a
                  href={doc.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visualiser le document"
                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Voir
                </a>

                {/* Télécharger — gris neutre */}
                <a
                  href={doc.url_fichier}
                  download={doc.nom_fichier}
                  title="Télécharger le document"
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors active:scale-95 flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modales ── */}
      <ConfirmModal
        isOpen={deleteConfig.isOpen}
        title="Supprimer le document"
        message={`Attention : vous êtes sur le point de supprimer "${deleteConfig.titre}". Cette action est irréversible.`}
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