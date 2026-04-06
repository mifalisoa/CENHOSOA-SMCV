// frontend/src/presentation/components/patients/modals/TransfererLitModal.tsx

import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Bed, 
  ArrowRight,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import type { Patient } from '../../../../core/entities/Patient';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface TransfererLitModalProps {
  patient: Patient;
  litActuel: {
    id_lit: number;
    numero_lit: string;
    categorie: string;
  };
  onClose: () => void;
  onSuccess: () => void;
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

export default function TransfererLitModal({ 
  patient, 
  litActuel, 
  onClose, 
  onSuccess 
}: TransfererLitModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingLits, setLoadingLits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [litsDisponibles, setLitsDisponibles] = useState<LitDisponible[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [nouveauLit, setNouveauLit] = useState<string>('');
  const [motif, setMotif] = useState<string>('');

  const loadLitsDisponibles = useCallback(async () => {
    try {
      setLoadingLits(true);
      const response = await httpClient.get('/lits');
      console.log('Premier lit:', JSON.stringify(response.data[0]));
      // Filtrer uniquement les lits disponibles ET différents du lit actuel
      const lits = response.data.filter(
        (lit: LitDisponible & { statut: string }) => 
          lit.statut === 'disponible' && lit.id_lit !== litActuel.id_lit
      );
      setLitsDisponibles(lits);
    } catch (err) {
      console.error('Erreur chargement lits:', err);
      toast.error('Impossible de charger les lits disponibles');
    } finally {
      setLoadingLits(false);
    }
  }, [litActuel.id_lit]);

  useEffect(() => {
    loadLitsDisponibles();
  }, [loadLitsDisponibles]);

  const categoriesDisponibles = Array.from(new Set(litsDisponibles.map(l => l.categorie)))
    .sort((a: string, b: string) => {
      const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
      return (order[a] || 99) - (order[b] || 99);
    });

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
    return `Chambre ${chambre} - Lit ${lit.numero_lit}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Données envoyées:', {
    ancien_lit: litActuel.id_lit,
    nouveau_lit: parseInt(nouveauLit),
    nouveauLit_raw: nouveauLit,
  });

    if (!nouveauLit) {
      setError('Veuillez sélectionner un nouveau lit');
      return;
    }

    if (!motif.trim()) {
      setError('Veuillez saisir un motif de transfert');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await httpClient.post(`/patients/${patient.id_patient}/transferer-lit`, {
        ancien_lit: litActuel.id_lit,
        nouveau_lit: parseInt(nouveauLit),
        motif_transfert: motif,
        date_transfert: new Date().toISOString().split('T')[0]
      });

      const litSelectionne = litsDisponibles.find(l => l.id_lit === parseInt(nouveauLit));
      toast.success(
        `Patient transféré vers ${litSelectionne?.numero_lit || 'le nouveau lit'}`,
        { icon: <CheckCircle2 className="w-5 h-5 text-cyan-500" /> }
      );
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du transfert';
      setError(errorMessage);
      toast.error(errorMessage, { icon: <AlertCircle className="w-5 h-5" /> });
    } finally {
      setLoading(false);
    }
  };

  const countLitsParCategorie = (cat: string) => 
    litsDisponibles.filter(l => l.categorie === cat).length;

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
                <Bed className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-2xl font-bold tracking-tight">
                  Transfert de Lit
                </h2>
                <p className="text-cyan-100 text-sm font-medium opacity-90">
                  {patient.nom_patient} {patient.prenom_patient} • Dossier n°{patient.num_dossier}
                </p>
              </div>
            </div>
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

        {/* Lit actuel */}
        <div className="mx-6 mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-center gap-3">
            <Bed className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Lit actuel</p>
              <p className="text-lg font-bold text-blue-700">
                {litActuel.numero_lit} - {getCategorieLabel(litActuel.categorie)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded-r-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Sélection du nouveau lit */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ArrowRight className="w-4 h-4 text-cyan-600" />
              Sélectionner le nouveau lit
            </h3>

            {loadingLits ? (
              <div className="flex items-center justify-center py-4">
                <Spinner />
                <span className="ml-2 text-sm text-slate-500">Chargement...</span>
              </div>
            ) : litsDisponibles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                Aucun lit disponible pour le transfert
              </div>
            ) : (
              <>
                {/* Catégorie */}
                <div className="space-y-2">
                  <label htmlFor="categorie" className="text-xs font-semibold text-slate-600">
                    1. Catégorie de Lit
                  </label>
                  <select
                    id="categorie"
                    title="Catégorie de chambre"
                    value={selectedCategorie}
                    onChange={(e) => {
                      setSelectedCategorie(e.target.value);
                      setNouveauLit('');
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

                {/* Lit spécifique */}
                {selectedCategorie && (
                  <div className="space-y-2">
                    <label htmlFor="nouveau-lit" className="text-xs font-semibold text-slate-600">
                      2. Lit de destination
                    </label>
                    <select
                      id="nouveau-lit"
                      title="Numéro de lit"
                      value={nouveauLit}
                      onChange={(e) => setNouveauLit(e.target.value)}
                      className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm"
                    >
                      <option value="">Sélectionner un lit...</option>
                      {litsParCategorie.map(lit => (
                        <option key={lit.id_lit} value={lit.id_lit}>
                          {getLitLabel(lit)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <label htmlFor="motif" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-cyan-600" />
              Motif du transfert <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motif"
              rows={3}
              required
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Demande du patient, problème technique, aggravation de l'état..."
              className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !nouveauLit}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? <Spinner /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{loading ? "Transfert..." : "Confirmer le transfert"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}