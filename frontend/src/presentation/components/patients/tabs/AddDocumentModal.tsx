import { useState, useRef, useCallback } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, File, Image as ImageIcon, Video, FileText } from 'lucide-react';
import type { CreateDocumentPatientDTO, TypeFichier } from '../../../../core/entities/DocumentPatient';
import type { Patient } from '../../../../core/entities/Patient';
import { httpClient } from '../../../../infrastructure/http/axios.config';

interface AddDocumentModalProps {
  patient:  Patient;
  onClose:  () => void;
  onSubmit: (data: CreateDocumentPatientDTO) => Promise<void>;
}

// ── Types de fichiers acceptés ────────────────────────────────────────────────
const ACCEPTED_TYPES: Record<string, { label: string; icon: React.ReactNode }> = {
  'application/pdf':  { label: 'PDF',  icon: <File      className="w-4 h-4 text-gray-500" /> },
  'image/jpeg':       { label: 'JPG',  icon: <ImageIcon className="w-4 h-4 text-gray-500" /> },
  'image/jpg':        { label: 'JPG',  icon: <ImageIcon className="w-4 h-4 text-gray-500" /> },
  'image/png':        { label: 'PNG',  icon: <ImageIcon className="w-4 h-4 text-gray-500" /> },
  'video/mp4':        { label: 'MP4',  icon: <Video     className="w-4 h-4 text-gray-500" /> },
  'video/avi':        { label: 'AVI',  icon: <Video     className="w-4 h-4 text-gray-500" /> },
};

const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

const REQUIRED_FIELDS = ['titre'] as const;

export default function AddDocumentModal({ patient, onClose, onSubmit }: AddDocumentModalProps) {
  const [loading,        setLoading]        = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging,     setIsDragging]     = useState(false);
  const [touched,        setTouched]        = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<CreateDocumentPatientDTO>>({
    id_patient:  patient.id_patient,
    date_ajout:  new Date().toISOString(),
    heure_ajout: new Date().toTimeString().slice(0, 5),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError,    setFileError]    = useState<string | null>(null);

  // ── Validation ────────────────────────────────────────────────────────────────
  const getError = (field: string): string | null => {
    if (!touched[field]) return null;
    if (REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number])) {
      const val = formData[field as keyof typeof formData];
      if (!val || String(val).trim() === '') return 'Champ obligatoire';
    }
    return null;
  };

  const isFormValid =
    !!selectedFile &&
    !fileError &&
    REQUIRED_FIELDS.every(f => {
      const val = formData[f as keyof typeof formData];
      return val && String(val).trim() !== '';
    });

  const mark = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  const cx = (field: string) => {
    const err = getError(field);
    const val = formData[field as keyof typeof formData];
    const ok  = touched[field] && !err && val && String(val).trim();
    return `w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
      err ? 'border-red-300 bg-red-50 focus:ring-red-100'
      : ok ? 'border-green-300 bg-green-50 focus:ring-green-100'
      : 'border-gray-200 focus:border-cyan-400 focus:ring-cyan-100'
    }`;
  };

  const Lbl = ({ field, children, req }: {
    field: string; children: React.ReactNode; req?: boolean;
  }) => {
    const err = getError(field);
    const val = formData[field as keyof typeof formData];
    const ok  = touched[field] && !err && val && String(val).trim();
    return (
      <label htmlFor={field}
        className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
        <span>{children}{req && <span className="text-red-500 ml-0.5">*</span>}</span>
        {ok  && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
        {err && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
      </label>
    );
  };

  const FieldErr = ({ field }: { field: string }) => {
    const e = getError(field);
    return e
      ? <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{e}</p>
      : null;
  };

  // ── Traitement fichier sélectionné ────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setFileError(null);

    if (!ACCEPTED_TYPES[file.type]) {
      setFileError('Type non supporté. Formats acceptés : PDF, JPG, PNG, MP4, AVI');
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError('Fichier trop volumineux. Maximum : 500 MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    let typeFichier: TypeFichier = 'pdf';
    if (file.type.startsWith('image/')) typeFichier = 'image';
    else if (file.type.startsWith('video/')) typeFichier = 'video';

    setFormData(prev => ({
      ...prev,
      titre:          prev.titre || file.name.replace(/\.[^/.]+$/, ''),
      type_fichier:   typeFichier,
      nom_fichier:    file.name,
      taille_fichier: file.size,
    }));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Drag & Drop réel ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── Upload ────────────────────────────────────────────────────────────────────
  const handleUploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('id_patient', patient.id_patient.toString());
      uploadFormData.append('file', selectedFile);

      const response = await httpClient.post('/documents-patients/upload', uploadFormData, {
        onUploadProgress: (evt: { loaded: number; total?: number }) => {
          const pct = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
          setUploadProgress(pct);
        },
      });

      return response.data.data.url_fichier;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg || 'Erreur lors de l\'upload du fichier');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ── Soumission ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.fromEntries(REQUIRED_FIELDS.map(f => [f, true])));
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const urlFichier = await handleUploadFile();
      if (!urlFichier) { setLoading(false); return; }

      await onSubmit({
        id_patient:     patient.id_patient,
        titre:          formData.titre!,
        type_fichier:   formData.type_fichier!,
        nom_fichier:    formData.nom_fichier!,
        url_fichier:    urlFichier,
        taille_fichier: formData.taille_fichier!,
        description:    formData.description,
        date_ajout:     formData.date_ajout!,
        heure_ajout:    formData.heure_ajout!,
        ajoute_par:     formData.ajoute_par,
      });
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-cyan-400 focus:ring-cyan-100';
  const fileInfo  = selectedFile ? ACCEPTED_TYPES[selectedFile.type] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header — cyan uniforme ── */}
        <div className="bg-cyan-600 px-5 py-4 sm:px-6 sm:py-5 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 shrink-0" />
              Ajouter un document
            </h2>
            <p className="text-cyan-100 text-sm mt-0.5">
              {patient.nom_patient} {patient.prenom_patient}
            </p>
          </div>
          <button onClick={onClose} title="Fermer" aria-label="Fermer la fenêtre"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Erreur globale */}
        {submitError && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shrink-0"
            role="alert">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <form id="document-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Zone upload / drag & drop ── */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Fichier<span className="text-red-500 ml-0.5">*</span>
                <span className="text-gray-400 font-normal ml-1 text-xs">PDF, JPG, PNG, MP4, AVI — max 500 MB</span>
              </span>
              {selectedFile && !fileError && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              {fileError && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                fileError
                  ? 'border-red-300 bg-red-50'
                  : selectedFile
                    ? 'border-green-300 bg-green-50'
                    : isDragging
                      ? 'border-cyan-400 bg-cyan-50 scale-[1.01]'
                      : 'border-gray-300 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50'
              }`}>
              <input id="file-upload" ref={fileInputRef} type="file"
                title="Sélectionner un fichier"
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.avi"
                onChange={handleFileSelect}
                className="hidden" />

              {selectedFile && !fileError ? (
                /* Fichier sélectionné avec succès */
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                    {fileInfo?.icon ?? <FileText className="w-6 h-6 text-gray-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {fileInfo?.label} · {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button type="button" onClick={clearFile}
                    className="text-xs text-gray-500 hover:text-red-600 underline transition-colors">
                    Changer de fichier
                  </button>
                </div>
              ) : isDragging ? (
                /* Glisser en cours */
                <div className="space-y-2 py-2">
                  <Upload className="w-10 h-10 text-cyan-500 mx-auto" />
                  <p className="text-cyan-700 font-semibold text-sm">Déposez le fichier ici</p>
                </div>
              ) : (
                /* État vide */
                <div className="space-y-2 py-2">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-700 font-medium text-sm">Cliquez ou glissez-déposez</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, MP4, AVI · max 500 MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Erreur fichier */}
            {fileError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{fileError}
              </p>
            )}

            {/* ✅ Barre de progression — cyan */}
            {uploading && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Upload en cours...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── Titre ── */}
          <div>
            <Lbl field="titre" req>Titre du document</Lbl>
            <input id="titre" type="text" required
              value={formData.titre || ''}
              placeholder="Ex: Résultats IRM cardiaque, ECG du 12/01..."
              onChange={e => setFormData({ ...formData, titre: e.target.value })}
              onBlur={() => mark('titre')}
              className={cx('titre')} />
            <FieldErr field="titre" />
          </div>

          {/* ── Description ── */}
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Description
            </label>
            <textarea id="description" rows={3}
              value={formData.description || ''}
              placeholder="Description du document (optionnel)..."
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={`${inputBase} resize-none`} />
          </div>

          {/* ── Ajouté par ── */}
          <div>
            <label htmlFor="ajoute_par" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Ajouté par
            </label>
            <input id="ajoute_par" type="text"
              value={formData.ajoute_par || ''}
              placeholder="Nom de la personne qui ajoute le document"
              onChange={e => setFormData({ ...formData, ajoute_par: e.target.value })}
              className={inputBase} />
          </div>

          <p className="text-xs text-gray-400"><span className="text-red-500">*</span> Champs obligatoires</p>
        </form>

        {/* ── Footer ── */}
        <div className="border-t bg-gray-50 px-5 py-4 flex justify-end items-center gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={loading || uploading}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50">
            Annuler
          </button>
          {/* ✅ type="submit" lié au form — grisé si invalide */}
          <button type="submit" form="document-form" disabled={loading || uploading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isFormValid && !loading && !uploading
                ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            {loading || uploading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {uploading ? 'Upload...' : 'Enregistrement...'}</>
              : <><CheckCircle2 className="w-4 h-4" />Ajouter le document</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}