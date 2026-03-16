import { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Bed
  // Heart supprimé car inutilisé
} from 'lucide-react';
import type { Patient } from '../../../core/entities/Patient';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface HospitaliserModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

interface HospitalisationPayload {
  motif_hospitalisation: string;
  service_hospitalisation: string;
  date_admission: string;
  id_lit?: number;
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LitDisponible {
  id_lit: number;
  numero_lit: string;
  categorie: string;
  etage?: string;
  statut?: string;
}

const Spinner = () => (
  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
);

export default function HospitaliserModal({ patient, onClose, onSuccess }: HospitaliserModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingLits, setLoadingLits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [litsDisponibles, setLitsDisponibles] = useState<LitDisponible[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');

  // Correction TypeScript : Forcer l'extraction de la string pour éviter le type string[]
  const today = new Date().toISOString().split('T')[0];
  

  const [formData, setFormData] = useState({
    motif_hospitalisation: '',
    service_hospitalisation: 'Cardiologie',
    id_lit: '',
    date_admission: today,
  });

  const services = [
    'Cardiologie', 'Médecine Générale', 'USIC - Soins Intensifs', 'VIP',
    'Pneumologie', 'Neurologie', 'Gastro-entérologie', 'Néphrologie', 
    'Endocrinologie', 'Rhumatologie', 'Médecine interne', 'Chirurgie générale', 
    'Urgences', 'Réanimation',
  ];

  useEffect(() => {
    const loadLitsDisponibles = async () => {
      try {
        setLoadingLits(true);
        const response = await httpClient.get('/lits');
        const lits = response.data.filter((lit: LitDisponible & { statut: string }) => lit.statut === 'disponible');
        setLitsDisponibles(lits);
      } catch (err) {
        console.error('Erreur chargement lits:', err);
      } finally {
        setLoadingLits(false);
      }
    };
    loadLitsDisponibles();
  }, []);

  const getCategoriePourService = (service: string): string[] => {
    switch (service) {
      case 'VIP': return ['1'];
      case 'USIC - Soins Intensifs': return ['USIC'];
      case 'Cardiologie':
      case 'Médecine Générale':
      case 'Médecine interne': return ['1', '2', '3'];
      default: return ['2', '3'];
    }
  };

  const categoriesDisponibles = Array.from(new Set(litsDisponibles.map(l => l.categorie)))
    .filter(cat => getCategoriePourService(formData.service_hospitalisation).includes(cat))
    .sort((a, b) => {
      const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
      return (order[a] || 99) - (order[b] || 99);
    });

  const litsParCategorie = selectedCategorie 
    ? litsDisponibles.filter(l => l.categorie === selectedCategorie)
    : [];

  const getCategorieLabel = (categorie: string) => {
    switch (categorie) {
      case '1': return 'Catégorie 1 - Individuelles';
      case '2': return 'Catégorie 2 - Doubles';
      case '3': return 'Catégorie 3 - Quadruples';
      case 'USIC': return 'USIC - Soins Intensifs';
      default: return categorie;
    }
  };

  const getLitLabel = (lit: LitDisponible): string => {
    const chambre = lit.numero_lit.startsWith('USIC') ? 'USIC' : lit.numero_lit.split('-');
    const num = lit.numero_lit.split('-');
    return `Chambre ${chambre} - Lit ${chambre}-${num}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.date_admission > today) {
      setError("La date d'admission ne peut pas être dans le futur.");
      return;
    }

    if (!formData.motif_hospitalisation.trim()) {
      setError('Veuillez saisir un motif d\'hospitalisation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: HospitalisationPayload = {
        motif_hospitalisation: formData.motif_hospitalisation,
        service_hospitalisation: formData.service_hospitalisation,
        date_admission: formData.date_admission,
      };

      if (formData.id_lit) {
        payload.id_lit = parseInt(formData.id_lit, 10);
      }

      await httpClient.post(`/patients/${patient.id_patient}/hospitaliser`, payload);
      toast.success(`${patient.nom_patient} hospitalisé(e) avec succès`, {
        icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as AxiosErrorResponse;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'hospitalisation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const countLitsParCategorie = (cat: string) => litsDisponibles.filter(l => l.categorie === cat).length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-100"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="bg-gradient-to-r from-cyan-600 to-sky-700 p-6 text-white sticky top-0 z-10">
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
            {/* Ajout du title pour corriger l'erreur Microsoft Edge Tools */}
            <button 
              onClick={onClose} 
              className="text-white/70 hover:text-white p-2 transition-colors" 
              aria-label="Fermer"
              title="Fermer la fenêtre"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded-r-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date_admission" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Date d'admission
              </label>
              <input
                id="date_admission"
                type="date"
                required
                max={today}
                value={formData.date_admission}
                onChange={(e) => setFormData(prev => ({ ...prev, date_admission: e.target.value }))}
                className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="service_hospitalisation" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 className="w-4 h-4 text-cyan-600" />
                Service de destination
              </label>
              <select
                id="service_hospitalisation"
                title="Service de destination"
                required
                value={formData.service_hospitalisation}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, service_hospitalisation: e.target.value, id_lit: '' }));
                  setSelectedCategorie('');
                }}
                className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm"
              >
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="motif_medical" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Motif médical <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motif_medical"
              rows={3}
              required
              value={formData.motif_hospitalisation}
              onChange={(e) => setFormData(prev => ({ ...prev, motif_hospitalisation: e.target.value }))}
              placeholder="Ex: Insuffisance cardiaque aiguë..."
              className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Bed className="w-4 h-4 text-cyan-600" />
              Assignation de Lit
            </h3>

            {loadingLits ? (
              <div className="flex items-center justify-center py-4"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="select-categorie" className="text-xs font-semibold text-slate-600">1. Catégorie de Lit</label>
                  <select
                    id="select-categorie"
                    title="Catégorie de chambre"
                    value={selectedCategorie}
                    onChange={(e) => {
                      setSelectedCategorie(e.target.value);
                      setFormData(prev => ({ ...prev, id_lit: '' }));
                    }}
                    className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm"
                  >
                    <option value="">Choisir une catégorie...</option>
                    {categoriesDisponibles.map(cat => (
                      <option key={cat} value={cat}>
                        {getCategorieLabel(cat)} ({countLitsParCategorie(cat)} libre(s))
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategorie && (
                  <div className="space-y-2">
                    <label htmlFor="select-lit" className="text-xs font-semibold text-slate-600">2. Lit spécifique</label>
                    <select
                      id="select-lit"
                      title="Numéro de lit"
                      value={formData.id_lit}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_lit: e.target.value }))}
                      className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm"
                    >
                      <option value="">Assigner plus tard</option>
                      {litsParCategorie.map(lit => (
                        <option key={lit.id_lit} value={lit.id_lit.toString()}>{getLitLabel(lit)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-3 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors"
              title="Annuler l'hospitalisation"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
              title="Valider l'admission du patient"
            >
              {loading ? <Spinner /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{loading ? "Traitement..." : "Confirmer l'admission"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}