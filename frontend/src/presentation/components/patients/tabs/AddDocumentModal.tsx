import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import type { CreateDocumentPatientDTO, TypeFichier } from '../../../../core/entities/DocumentPatient';
import type { Patient } from '../../../../core/entities/Patient';
import { httpClient } from '../../../../infrastructure/http/axios.config';

// Composant Spinner séparé
const Spinner = () => (
  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

interface AddDocumentModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateDocumentPatientDTO) => Promise<void>;
}

export default function AddDocumentModal({ patient, onClose, onSubmit }: AddDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<CreateDocumentPatientDTO>>({
    id_patient: patient.id_patient,
    date_ajout: new Date().toISOString(),
    heure_ajout: new Date().toTimeString().slice(0, 5),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Formats acceptés: PDF, Images (JPG, PNG), Vidéos (MP4, AVI)');
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux. Taille maximale: 500 MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    let typeFichier: TypeFichier = 'pdf';
    if (file.type.startsWith('image/')) {
      typeFichier = 'image';
    } else if (file.type.startsWith('video/')) {
      typeFichier = 'video';
    }

    setFormData({
      ...formData,
      titre: formData.titre || file.name.replace(/\.[^/.]+$/, ''),
      type_fichier: typeFichier,
      nom_fichier: file.name,
      taille_fichier: file.size,
    });
  };

  const handleUploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('id_patient', patient.id_patient.toString());
      uploadFormData.append('file', selectedFile);

      const response = await httpClient.post('/documents-patients/upload', uploadFormData, {
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      return response.data.data.url_fichier;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message;
      console.error('Erreur upload:', err);
      setError(errorMessage || 'Erreur lors de l\'upload du fichier');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    if (!formData.titre) {
      setError('Veuillez saisir un titre');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urlFichier = await handleUploadFile();
      if (!urlFichier) {
        setLoading(false);
        return;
      }

      const documentData: CreateDocumentPatientDTO = {
        id_patient: patient.id_patient,
        titre: formData.titre!,
        type_fichier: formData.type_fichier!,
        nom_fichier: formData.nom_fichier!,
        url_fichier: urlFichier,
        taille_fichier: formData.taille_fichier!,
        description: formData.description,
        date_ajout: formData.date_ajout!,
        heure_ajout: formData.heure_ajout!,
        ajoute_par: formData.ajoute_par,
      };

      await onSubmit(documentData);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Upload className="w-7 h-7" />
                Ajouter un document
              </h2>
              <p className="text-cyan-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            {/* CORRECTION 1: Ajout de title et aria-label pour l'accessibilité */}
            <button
              onClick={onClose}
              title="Fermer la fenêtre"
              aria-label="Fermer la fenêtre"
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2" role="alert">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Upload Zone */}
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Fichier * (PDF, Image, Vidéo - Max 500MB)
              </label>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                }`}
              >
                {/* CORRECTION 2: Ajout de title et id pour lier le label à l'input */}
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  title="Sélectionner un fichier"
                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.avi"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-semibold text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-700 font-medium">Cliquez pour sélectionner un fichier</p>
                      <p className="text-sm text-gray-500 mt-1">ou glissez-déposez le fichier ici</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du document *
              </label>
              <input
                id="doc-title"
                type="text"
                required
                value={formData.titre || ''}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Résultats IRM cardiaque"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="doc-desc" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="doc-desc"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du document..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Ajouté par */}
            <div>
              <label htmlFor="added-by" className="block text-sm font-medium text-gray-700 mb-2">
                Ajouté par
              </label>
              <input
                id="added-by"
                type="text"
                value={formData.ajoute_par || ''}
                onChange={(e) => setFormData({ ...formData, ajoute_par: e.target.value })}
                placeholder="Nom de la personne qui ajoute le document"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading || !selectedFile}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 font-medium shadow-md flex items-center gap-2"
          >
            {loading || uploading ? (
              <>
                <Spinner />
                {uploading ? 'Upload...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Ajouter le document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}