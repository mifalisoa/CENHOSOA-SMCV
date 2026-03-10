import { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Loader2 
} from 'lucide-react';
import type { Patient } from '../../../core/entities/Patient';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface RendreExterneModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

// Interface pour typer l'erreur sans utiliser 'any'
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Spinner = () => (
  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
);

export default function RendreExterneModal({ patient, onClose, onSuccess }: RendreExterneModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    motif_sortie: '',
    date_sortie: new Date().toISOString().split('T')[0],
  });

  const motifsCommuns = [
    'Guérison',
    'Amélioration clinique',
    'Suite de soins à domicile',
    'Transfert vers autre établissement',
    'Sortie contre avis médical',
    'Décès',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motif_sortie.trim()) {
      setError('Veuillez saisir un motif de sortie');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.post(`/patients/${patient.id_patient}/rendre-externe`, {
        motif_sortie: formData.motif_sortie,
        date_sortie: formData.date_sortie,
      });

      if (response.data.success) {
        toast.success(`${patient.nom_patient} est maintenant externe`, {
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />
        });
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosErrorResponse;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de la sortie';
      console.error('Erreur sortie:', err);
      setError(errorMessage);
      toast.error(errorMessage, { icon: <AlertCircle className="w-5 h-5" /> });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-cyan-100 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-labelledby="modal-title"
      >
        
        {/* Header - Thème Cyan */}
        <div className="bg-gradient-to-r from-cyan-600 to-sky-700 p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-2xl font-bold tracking-tight">Fin d'Hospitalisation</h2>
                <p className="text-cyan-100 text-sm font-medium opacity-90">
                  {patient.nom_patient} {patient.prenom_patient} • Dossier n°{patient.num_dossier}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              title="Fermer la fenêtre"
              aria-label="Fermer"
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded-r-lg" role="alert">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form Body */}
        <form id="sortie-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Date de sortie */}
          <div className="space-y-2">
            <label 
              htmlFor="date_sortie" 
              className="flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <Calendar className="w-4 h-4 text-cyan-600" />
              Date de sortie effective
            </label>
            <input
              id="date_sortie"
              type="date"
              required
              value={formData.date_sortie}
              onChange={(e) => setFormData({ ...formData, date_sortie: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all outline-none font-medium"
            />
          </div>

          {/* Motifs Rapides */}
          <div className="space-y-3">
            <span className="block text-sm font-bold text-slate-700">
              Motifs fréquents
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection de motifs rapides">
              {motifsCommuns.map((motif) => (
                <button
                  key={motif}
                  type="button"
                  onClick={() => setFormData({ ...formData, motif_sortie: motif })}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                    formData.motif_sortie === motif 
                    ? 'bg-cyan-100 border-cyan-400 text-cyan-700 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'
                  }`}
                >
                  {motif}
                </button>
              ))}
            </div>
          </div>

          {/* Motif de sortie (Textarea) */}
          <div className="space-y-2">
            <label 
              htmlFor="motif_sortie" 
              className="flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <FileText className="w-4 h-4 text-cyan-600" />
              Observations / Motif détaillé
            </label>
            <textarea
              id="motif_sortie"
              rows={4}
              required
              value={formData.motif_sortie}
              onChange={(e) => setFormData({ ...formData, motif_sortie: e.target.value })}
              placeholder="Décrivez les conditions de sortie..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all outline-none resize-none font-medium"
            />
          </div>

          {/* Info Box */}
          <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-cyan-800 leading-relaxed">
              <strong>Note :</strong> Cette action libère automatiquement le lit occupé par le patient.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-5 flex justify-end items-center gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            form="sortie-form"
            disabled={loading}
            className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Confirmer la sortie</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}