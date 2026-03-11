import { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Bed,
  Heart
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

  const [formData, setFormData] = useState({
    motif_hospitalisation: '',
    service_hospitalisation: 'Cardiologie',
    id_lit: '',
    date_admission: new Date().toISOString().split('T')[0],
  });

  const services = [
    'Cardiologie', 
    'Médecine Générale',
    'USIC - Soins Intensifs',
    'VIP',
    'Pneumologie', 
    'Neurologie', 
    'Gastro-entérologie',
    'Néphrologie', 
    'Endocrinologie', 
    'Rhumatologie', 
    'Médecine interne',
    'Chirurgie générale', 
    'Urgences', 
    'Réanimation',
  ];

  // Charger les lits disponibles
  useEffect(() => {
    loadLitsDisponibles();
  }, []);

  const loadLitsDisponibles = async () => {
    try {
      setLoadingLits(true);
      const response = await httpClient.get('/lits');
      const lits = response.data.filter((lit: LitDisponible & { statut: string }) => lit.statut === 'disponible');
      setLitsDisponibles(lits);
    } catch (error) {
      console.error('Erreur chargement lits:', error);
    } finally {
      setLoadingLits(false);
    }
  };

  // Mapping des services aux catégories de lits
  const getCategoriePourService = (service: string): string[] => {
    switch (service) {
      case 'VIP':
        return ['1'];
      case 'USIC - Soins Intensifs':
        return ['USIC'];
      case 'Cardiologie':
      case 'Médecine Générale':
      case 'Médecine interne':
        return ['1', '2', '3'];
      default:
        return ['2', '3'];
    }
  };

  // Grouper par catégorie
  const categoriesDisponibles = Array.from(new Set(litsDisponibles.map(l => l.categorie)))
    .filter(cat => getCategoriePourService(formData.service_hospitalisation).includes(cat))
    .sort((a, b) => {
      const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
      return (order[a] || 99) - (order[b] || 99);
    });

  // Lits de la catégorie sélectionnée
  const litsParCategorie = selectedCategorie 
    ? litsDisponibles.filter(l => l.categorie === selectedCategorie)
    : [];

  const getCategorieLabel = (categorie: string) => {
    switch (categorie) {
      case '1': return 'Catégorie 1 - Chambres Individuelles';
      case '2': return 'Catégorie 2 - Chambres Doubles';
      case '3': return 'Catégorie 3 - Chambre Quadruple';
      case 'USIC': return 'USIC - Soins Intensifs';
      default: return categorie;
    }
  };

  const getLitLabel = (lit: LitDisponible): string => {
    const chambre = lit.numero_lit.startsWith('USIC') 
      ? 'USIC' 
      : lit.numero_lit.split('-')[0];
    const num = lit.numero_lit.split('-')[1];
    return `Chambre ${chambre} - Lit ${chambre}-${num}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      if (formData.id_lit && !isNaN(parseInt(formData.id_lit))) {
        payload.id_lit = parseInt(formData.id_lit);
      }

      await httpClient.post(`/patients/${patient.id_patient}/hospitaliser`, payload);

      const litMsg = formData.id_lit 
        ? ` et assigné au lit`
        : '';
      toast.success(`${patient.nom_patient} a été hospitalisé(e) avec succès${litMsg}`, {
        icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" />
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as AxiosErrorResponse;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'hospitalisation';
      
      console.error('Erreur hospitalisation:', err);
      setError(errorMessage);
      toast.error(errorMessage, { icon: <AlertCircle className="w-5 h-5" /> });
    } finally {
      setLoading(false);
    }
  };

  // Compter les lits disponibles par catégorie
  const countLitsParCategorie = (cat: string) => {
    return litsDisponibles.filter(l => l.categorie === cat).length;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-100"
        role="dialog"
        aria-labelledby="modal-title"
      >
        
        {/* Header */}
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
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
              aria-label="Fermer"
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

        {/* Corps du Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Date et Service en ligne */}
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
                value={formData.date_admission}
                onChange={(e) => setFormData({ ...formData, date_admission: e.target.value })}
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
                required
                value={formData.service_hospitalisation}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    service_hospitalisation: e.target.value,
                    id_lit: ''
                  });
                  setSelectedCategorie('');
                }}
                className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              >
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <label htmlFor="motif_medical" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Motif médical de l'admission <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motif_medical"
              rows={3}
              required
              value={formData.motif_hospitalisation}
              onChange={(e) => setFormData({ ...formData, motif_hospitalisation: e.target.value })}
              placeholder="Ex: Décompensation cardiaque, dyspnée..."
              className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm"
            />
          </div>

          {/* Assignation de Lit */}
          <div className="space-y-3 border-t pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Bed className="w-4 h-4 text-cyan-600" />
              Assignation de Lit
            </label>

            {loadingLits ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
                <span className="ml-2 text-sm text-slate-500">Chargement...</span>
              </div>
            ) : (
              <>
                {/* 1. Catégorie de Lit */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">1. Catégorie de Lit *</label>
                  <select
                    value={selectedCategorie}
                    onChange={(e) => {
                      setSelectedCategorie(e.target.value);
                      setFormData({ ...formData, id_lit: '' });
                    }}
                    className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categoriesDisponibles.map(cat => (
                      <option key={cat} value={cat}>
                        {getCategorieLabel(cat)} ({countLitsParCategorie(cat)} disponible(s))
                      </option>
                    ))}
                  </select>
                  {selectedCategorie && (
                    <p className="text-xs text-cyan-600 flex items-center gap-1">
                      {selectedCategorie === 'USIC' && <Heart className="w-3 h-3" />}
                      ♥ Catégorie {selectedCategorie}
                    </p>
                  )}
                </div>

                {/* 2. Lit à Assigner */}
                {selectedCategorie && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">2. Lit à Assigner *</label>
                    <select
                      value={formData.id_lit}
                      onChange={(e) => setFormData({ ...formData, id_lit: e.target.value })}
                      className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    >
                      <option value="">Aucun lit (assigner plus tard)</option>
                      {litsParCategorie.map(lit => (
                        <option key={lit.id_lit} value={lit.id_lit}>
                          {getLitLabel(lit)}
                        </option>
                      ))}
                    </select>
                    {formData.id_lit && (
                      <p className="text-xs text-cyan-600 flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        Lit sélectionné : {litsParCategorie.find(l => l.id_lit === parseInt(formData.id_lit))?.numero_lit}
                      </p>
                    )}
                  </div>
                )}

                {litsDisponibles.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                    Aucun lit disponible. Le patient sera hospitalisé sans lit assigné.
                  </div>
                )}
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-3 border-t sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Valider l'admission</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}