// frontend/src/presentation/components/patients/tabs/QuickBilanAttachmentButton.tsx

import { useRef, useState } from 'react';
import { Camera, Paperclip, Loader2 } from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { usePiecesJointes } from '../../../hooks/usePiecesJointes';
import type { CreateBilanBiologiqueDTO, BilanBiologique } from '../../../../core/entities/BilanBiologique';
import type { TypePieceJointe } from '../../../../core/entities/PieceJointe';
import { toast } from 'sonner';

interface QuickBilanAttachmentButtonProps {
  patientId:  number;
  createBilan: (data: CreateBilanBiologiqueDTO) => Promise<BilanBiologique | null>;
}

export default function QuickBilanAttachmentButton({ patientId, createBilan }: QuickBilanAttachmentButtonProps) {
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On réutilise le hook, mais sans entiteId au départ — on l'utilisera juste pour sa fonction createPieceJointe
  const { createPieceJointe } = usePiecesJointes('bilan_biologique', undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Étape 1 — créer un bilan minimal
      const now = new Date();
      const nouveauBilan = await createBilan({
        id_patient:        patientId,
        date_prelevement:  now.toISOString().split('T')[0],
        heure_prelevement: now.toTimeString().slice(0, 5),
        type_bilan:        'Pièce jointe rapide',
      });

      if (!nouveauBilan) {
        toast.error('Erreur lors de la création du bilan');
        return;
      }

      // Étape 2 — upload physique du fichier
      const formData = new FormData();
      formData.append('id_patient', patientId.toString());
      formData.append('file', file);

      const uploadResponse = await httpClient.post('/documents-patients/upload', formData);
      const { url_fichier, nom_fichier, taille_fichier } = uploadResponse.data.data;

      let typeFichier: TypePieceJointe = 'pdf';
      if (file.type.startsWith('image/')) typeFichier = 'image';
      else if (file.type.startsWith('video/')) typeFichier = 'video';

      // Étape 3 — rattacher la pièce jointe au bilan fraîchement créé
      await createPieceJointe({
        entite_type:    'bilan_biologique',
        entite_id:       nouveauBilan.id_bilan,
        url_fichier,
        nom_fichier,
        type_fichier:    typeFichier,
        taille_fichier,
      });

      toast.success('Bilan créé avec pièce jointe !');
    } catch (err) {
      console.error('Erreur ajout rapide:', err);
      toast.error("Erreur lors de l'ajout rapide");
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        title="Créer un bilan avec une pièce jointe en un clic"
        className="flex-1 sm:flex-none px-4 py-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 rounded-lg transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {processing
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="hidden sm:inline">Ajout en cours...</span></>
          : <><Camera className="w-4 h-4" /><Paperclip className="w-4 h-4" /><span className="hidden sm:inline">Ajout rapide</span></>
        }
      </button>
    </>
  );
}