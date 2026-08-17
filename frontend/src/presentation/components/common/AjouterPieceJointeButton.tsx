// frontend/src/presentation/components/common/AjouterPieceJointeButton.tsx

import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Paperclip, X, File, Loader2 } from 'lucide-react';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { usePiecesJointes } from '../../hooks/usePiecesJointes';
import type { EntiteType, TypePieceJointe } from '../../../core/entities/PieceJointe';
import { toast } from 'sonner';

interface AjouterPieceJointeButtonProps {
  entiteType: EntiteType;
  entiteId:    number;
  patientId:   number; 
}


export default function AjouterPieceJointeButton({ entiteType, entiteId, patientId }: AjouterPieceJointeButtonProps) {
  const { piecesJointes, loading, createPieceJointe, deletePieceJointe } = usePiecesJointes(entiteType, entiteId);
  const [uploading, setUploading] = useState(false);

  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const galerieInputRef = useRef<HTMLInputElement>(null);
  const fichierInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Étape 1 — upload physique du fichier
      const formData = new FormData();
      formData.append('id_patient', patientId.toString()); // dossier générique, pas lié à un patient précis
      formData.append('file', file);

      const uploadResponse = await httpClient.post('/documents-patients/upload', formData);
      const { url_fichier, nom_fichier, taille_fichier } = uploadResponse.data.data;

      let typeFichier: TypePieceJointe = 'pdf';
      if (file.type.startsWith('image/')) typeFichier = 'image';
      else if (file.type.startsWith('video/')) typeFichier = 'video';

      // Étape 2 — rattachement à l'entité (bilan, soin, traitement...)
      await createPieceJointe({
        entite_type:    entiteType,
        entite_id:       entiteId,
        url_fichier,
        nom_fichier,
        type_fichier:    typeFichier,
        taille_fichier,
      });

      toast.success('Pièce jointe ajoutée');
    } catch (err) {
      console.error('Erreur upload pièce jointe:', err);
      toast.error("Erreur lors de l'ajout de la pièce jointe");
    } finally {
      setUploading(false);
      e.target.value = ''; // permet de réuploader le même fichier une 2e fois si besoin
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await deletePieceJointe(id);
    if (ok) toast.success('Pièce jointe supprimée');
    else     toast.error('Erreur lors de la suppression');
  };

  return (
    <div className="space-y-2">
      {/* Inputs cachés, un par mode de sélection */}
      <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment"
        onChange={handleFileChange} className="hidden" />
      <input ref={galerieInputRef} type="file" accept="image/*"
        onChange={handleFileChange} className="hidden" />
      <input ref={fichierInputRef} type="file" accept=".pdf,.doc,.docx"
        onChange={handleFileChange} className="hidden" />
{/* Boutons visibles */}
<div className="flex items-center gap-2">
  <span className="text-xs font-medium text-gray-400 mr-1">Pièce jointe :</span>
  <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={uploading}
    title="Prendre une photo"
    className="p-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg transition-colors disabled:opacity-50">
    <Camera className="w-5 h-5 text-cyan-600" />
  </button>
  <button type="button" onClick={() => galerieInputRef.current?.click()} disabled={uploading}
    title="Choisir depuis la galerie"
    className="p-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg transition-colors disabled:opacity-50">
    <ImageIcon className="w-5 h-5 text-cyan-600" />
  </button>
  <button type="button" onClick={() => fichierInputRef.current?.click()} disabled={uploading}
    title="Joindre un fichier (PDF...)"
    className="p-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg transition-colors disabled:opacity-50">
    <Paperclip className="w-5 h-5 text-cyan-600" />
  </button>
  {uploading && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
  {!loading && piecesJointes.length > 0 && (
    <span className="text-xs text-gray-400">{piecesJointes.length} pièce{piecesJointes.length > 1 ? 's' : ''} jointe{piecesJointes.length > 1 ? 's' : ''}</span>
  )}
</div>

      {/* Rangée de vignettes */}
      {piecesJointes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {piecesJointes.map(pj => (
            <div key={pj.id_piece_jointe} className="relative group">
              <a href={pj.url_fichier} target="_blank" rel="noopener noreferrer"
                className="block w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center hover:border-cyan-400 transition-colors">
                {pj.type_fichier === 'image'
                  ? <img src={pj.url_fichier} alt={pj.nom_fichier} className="w-full h-full object-cover" />
                  : <File className="w-6 h-6 text-gray-400" />
                }
              </a>
              <button type="button" onClick={() => handleDelete(pj.id_piece_jointe)}
                title="Supprimer"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}