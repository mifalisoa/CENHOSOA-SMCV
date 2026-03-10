import { useState } from 'react';
import { 
  X, 
  Building2, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import type { Patient } from '../../../core/entities/Patient';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface HospitaliserModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

// 1. Correction de l'erreur ESLint : Définition d'un type pour le Payload
interface HospitalisationPayload {
  motif_hospitalisation: string;
  service_hospitalisation: string;
  date_admission: string;
  id_lit?: number;
}

// 2. Interface pour le typage sécurisé de l'erreur Axios
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

/**
 * Composant de chargement discret pour le bouton
 */
const Spinner = () => (
  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
);

export default function HospitaliserModal({ patient, onClose, onSuccess }: HospitaliserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    motif_hospitalisation: '',
    service_hospitalisation: 'Cardiologie',
    id_lit: '',
    date_admission: new Date().toISOString().split('T')[0],
  });

  const services = [
    'Cardiologie', 'Pneumologie', 'Neurologie', 'Gastro-entérologie',
    'Néphrologie', 'Endocrinologie', 'Rhumatologie', 'Médecine interne',
    'Chirurgie générale', 'Urgences', 'Réanimation', 'Soins intensifs',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motif_hospitalisation.trim()) {
      setError('Veuillez saisir un motif d\'hospitalisation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 3. Utilisation du type Payload au lieu de 'any'
      const payload: HospitalisationPayload = {
        motif_hospitalisation: formData.motif_hospitalisation,
        service_hospitalisation: formData.service_hospitalisation,
        date_admission: formData.date_admission,
      };

      if (formData.id_lit && !isNaN(parseInt(formData.id_lit))) {
        payload.id_lit = parseInt(formData.id_lit);
      }

      const response = await httpClient.post(`/patients/${patient.id_patient}/hospitaliser`, payload);

      if (response.data.success) {
        toast.success(`${patient.nom_patient} a été hospitalisé(e) avec succès`, {
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />,
          style: { borderRadius: '12px' }
        });
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      // 4. Typage sécurisé de l'erreur Axios sans 'any'
      const axiosError = err as AxiosErrorResponse;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'hospitalisation';
      
      console.error('Erreur hospitalisation:', err);
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
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-sky-700 p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-2xl font-bold tracking-tight">Nouvelle Hospitalisation</h2>
                <p className="text-cyan-100 text-sm font-medium opacity-90">
                  {patient.nom_patient} {patient.prenom_patient} • Dossier n°{patient.num_dossier}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
              title="Fermer la fenêtre"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded-r-lg" role="alert">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Corps du Formulaire */}
        <form id="hospitalisation-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date d'admission - Ajout de htmlFor/id pour accessibilité */}
            <div className="space-y-2">
              <label htmlFor="date_admission" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Date d'admission
              </label>
              <input
                id="date_admission"
                type="date"
                required
                value={formData.date_admission}
                onChange={(e) => setFormData({ ...formData, date_admission: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none font-medium"
              />
            </div>

            {/* Service Hospitalier - Ajout de htmlFor/id pour accessibilité */}
            <div className="space-y-2">
              <label htmlFor="service_hospitalisation" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Building2 className="w-4 h-4 text-cyan-600" />
                Service de destination
              </label>
              <div className="relative">
                <select
                  id="service_hospitalisation"
                  required
                  value={formData.service_hospitalisation}
                  onChange={(e) => setFormData({ ...formData, service_hospitalisation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all outline-none appearance-none cursor-pointer font-medium"
                  title="Sélectionnez le service"
                >
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Motif Médical - Ajout de htmlFor/id pour accessibilité */}
          <div className="space-y-2">
            <label htmlFor="motif_medical" className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Motif médical de l'admission
            </label>
            <textarea
              id="motif_medical"
              rows={4}
              required
              value={formData.motif_hospitalisation}
              onChange={(e) => setFormData({ ...formData, motif_hospitalisation: e.target.value })}
              placeholder="Ex: Patient présentant une détresse respiratoire aiguë..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all outline-none resize-none font-medium placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Footer */}
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
            form="hospitalisation-form"
            disabled={loading}
            className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Valider l'admission</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}