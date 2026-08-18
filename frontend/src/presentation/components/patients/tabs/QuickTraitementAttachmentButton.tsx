// frontend/src/presentation/components/patients/tabs/QuickTraitementAttachmentButton.tsx

import { useRef, useState } from 'react';
import { Camera, Paperclip, Loader2 } from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { usePiecesJointes } from '../../../hooks/usePiecesJointes';
import { useAuth } from '../../../hooks/useAuth';
import type { CreateTraitementDTO, Traitement } from '../../../../core/entities/Traitement';
import type { TypePieceJointe } from '../../../../core/entities/PieceJointe';
import { toast } from 'sonner';

interface QuickTraitementAttachmentButtonProps {
  patientId:        number;
  createTraitement: (data: CreateTraitementDTO) => Promise<Traitement | null>;
}

export default function QuickTraitementAttachmentButton({ patientId, createTraitement }: QuickTraitementAttachmentButtonProps) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPieceJointe } = usePiecesJointes('traitement', undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const now = new Date();
      const prescripteur = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || 'Utilisateur inconnu';

      const nouveauTraitement = await createTraitement({
        id_patient:          patientId,
        date_prescription:   now.toISOString().split('T')[0],
        heure_prescription:  now.toTimeString().slice(0, 5),
        type_document:       'ordonnance',
        medicament:          'Ordonnance manuscrite — voir pièce jointe',
        dosage:              'À vérifier sur le document',
        voie_administration: '-',
        frequence:           '-',
        duree:               '-',
        prescripteur,
      });

      if (!nouveauTraitement) {
        toast.error('Erreur lors de la création du traitement');
        return;
      }

      const formData = new FormData();
      formData.append('id_patient', patientId.toString());
      formData.append('file', file);

      const uploadResponse = await httpClient.post('/documents-patients/upload', formData);
      const { url_fichier, nom_fichier, taille_fichier } = uploadResponse.data.data;

      let typeFichier: TypePieceJointe = 'pdf';
      if (file.type.startsWith('image/')) typeFichier = 'image';
      else if (file.type.startsWith('video/')) typeFichier = 'video';

      await createPieceJointe({
        entite_type:    'traitement',
        entite_id:       nouveauTraitement.id_traitement,
        url_fichier,
        nom_fichier,
        type_fichier:    typeFichier,
        taille_fichier,
      });

      toast.success('Ordonnance photographiée ajoutée — en attente de validation');
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
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={processing}
        title="Photographier ou insérer une ordonnance manuscrite"
        className="flex-1 sm:flex-none px-4 py-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 rounded-lg transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
        {processing
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="hidden sm:inline">Ajout en cours...</span></>
          : <><Camera className="w-4 h-4" /><Paperclip className="w-4 h-4" /><span className="hidden sm:inline">Ordonnance photo</span></>}
      </button>
    </>
  );
}