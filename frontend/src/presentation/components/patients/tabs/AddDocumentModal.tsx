import { useState } from 'react';
import { X, Calendar, Clock, User, Upload, FileText, CheckCircle } from 'lucide-react';
import type { CreateDocumentPatientDTO } from '../../../../core/entities/DocumentPatient';
import type { Patient } from '../../../../core/entities/Patient';

interface AddDocumentModalProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: CreateDocumentPatientDTO) => Promise<void>;
}

export default function AddDocumentModal({ patient, onClose, onSubmit }: AddDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<Partial<CreateDocumentPatientDTO>>({
    id_patient: patient.id_patient,
    date_ajout: new Date().toISOString().split('T')[0],
    heure_ajout: new Date().toTimeString().slice(0, 5),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    let type_fichier: 'pdf' | 'image' | 'video' = 'pdf';
    if (file.type.startsWith('image/')) {
      type_fichier = 'image';
    } else if (file.type.startsWith('video/')) {
      type_fichier = 'video';
    }

    setFormData({
      ...formData,
      nom_fichier: file.name,
      taille_fichier: file.size,
      type_fichier,
      titre: formData.titre || file.name.replace(/\.[^/.]+$/, ''),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!formData.titre) {
      setError('Veuillez donner un titre au document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setUploadProgress(0);
      const url = URL.createObjectURL(selectedFile);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(interval);
      setUploadProgress(100);

      const documentData: CreateDocumentPatientDTO = {
        ...(formData as CreateDocumentPatientDTO),
        url_fichier: url,
      };

      await onSubmit(documentData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du document';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Ajouter un document
              </h2>
              <p className="text-blue-100 text-sm">
                Patient : {patient.nom_patient} {patient.prenom_patient}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Fermer la modal"
              aria-label="Fermer la modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <form id="add-doc-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Sélectionner le fichier
              </h3>

              <div className="space-y-4">
                {!selectedFile ? (
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-white hover:bg-blue-50/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-3 text-blue-400" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Cliquez pour parcourir</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500">PDF, Images ou Vidéos</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,image/*,video/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl" role="img" aria-label="type de fichier">
                          {formData.type_fichier === 'pdf' ? '📄' : 
                           formData.type_fichier === 'image' ? '🖼️' : '🎥'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFormData({ ...formData, nom_fichier: '', taille_fichier: 0, type_fichier: undefined });
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Supprimer le fichier"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {uploadProgress > 0 && uploadProgress <= 100 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{uploadProgress === 100 ? 'Terminé' : 'Upload en cours...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          {/* Fix: Style warning handled by using style only for dynamic property.
                              Tailwind handles the rest of the visual appearance. 
                          */}
                          <div
                            className="bg-blue-600 h-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h3 className="font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations du document
              </h3>

              <div className="space-y-4">
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
                    placeholder="Ex: Radiographie thorax, Analyses de sang..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="doc-desc" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="doc-desc"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description ou notes sur le document..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doc-date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date d'ajout
                    </label>
                    <input
                      id="doc-date"
                      type="date"
                      value={formData.date_ajout || ''}
                      onChange={(e) => setFormData({ ...formData, date_ajout: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="doc-time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Heure
                    </label>
                    <input
                      id="doc-time"
                      type="time"
                      value={formData.heure_ajout || ''}
                      onChange={(e) => setFormData({ ...formData, heure_ajout: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="doc-author" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Ajouté par
                  </label>
                  <input
                    id="doc-author"
                    type="text"
                    value={formData.ajoute_par || ''}
                    onChange={(e) => setFormData({ ...formData, ajoute_par: e.target.value })}
                    placeholder="Nom de la personne qui ajoute le document"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            form="add-doc-form"
            type="submit"
            disabled={loading || !selectedFile}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Action en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Ajouter le document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}