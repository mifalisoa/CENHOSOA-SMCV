// frontend/src/presentation/components/lits/LitManagement.tsx

import { useState, useEffect } from 'react';
import { motion }              from 'motion/react';
import {
  Bed, Clock, CheckCircle, ChevronLeft, BedDouble,
  Layers, Loader2, RefreshCw, Home, Search, Filter, X,
} from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import { Button }            from '../common/Button';
import { Badge }             from '../common/Badge';
import { toast }             from 'sonner';
import { httpClient }        from '../../../infrastructure/http/axios.config';

interface LitManagementProps { onBackToDashboard: () => void; }

interface Patient {
  id_patient:               number;
  nom_patient:              string;
  prenom_patient:           string;
  age:                      number;
  sexe_patient:             string;
  diagnostic:               string;
  date_admission:           Date;
  duree_occupation_heures:  number;
}

interface Lit {
  id_lit:          number;
  numero_lit:      string;
  categorie:       string;
  statut:          string;
  etage?:          string;
  batiment?:       string;
  patient_actuel?: Patient;
}

interface Chambre {
  nom:       string;
  categorie: string;
  capacite:  number;
  lits:      Lit[];
  etage?:    string;
}

interface CategorieStats {
  categorie:    string;
  total:        number;
  occupes:      number;
  disponibles:  number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategorieLabel       = (c: string) => ({ '1': 'Catégorie 1', '2': 'Catégorie 2', '3': 'Catégorie 3', 'USIC': 'USIC' }[c] ?? c);
const getCategorieDescription = (c: string) => ({ '1': 'Chambres Individuelles', '2': 'Chambres Doubles', '3': 'Chambre Quadruple', 'USIC': 'Soins Intensifs' }[c] ?? '');
const getTypeLit              = (c: string) => ({ '1': 'VIP', '2': 'Standard', '3': 'Standard', 'USIC': 'Soins Intensifs' }[c] ?? 'Standard');

const getLitLabel  = (lit: Lit) => `Lit N°${lit.numero_lit.split('-')[1]}`;
const formatDuration = (hours: number) => {
  const days = Math.floor(hours / 24);
  const h    = hours % 24;
  return days > 0 ? `${days}j ${h}h` : `${h}h`;
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function LitManagement({ onBackToDashboard }: LitManagementProps) {
  const [lits,               setLits]               = useState<Lit[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [initializing,       setInitializing]       = useState(false);
  const [selectedCategorie,  setSelectedCategorie]  = useState<string | null>(null);
  const [selectedStatut,     setSelectedStatut]     = useState<string | null>(null);
  const [searchPatient,      setSearchPatient]      = useState('');
  const [showFilters,        setShowFilters]        = useState(false);

  const loadLits = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/lits');
      setLits(response.data);
    } catch {
      toast.error('Erreur lors du chargement des lits');
    } finally { setLoading(false); }
  };

  const handleInitializeLits = async () => {
    try {
      setInitializing(true);
      await httpClient.post('/lits/initialiser');
      toast.success('20 lits CENHOSOA initialisés avec succès');
      await loadLits();
    } catch { toast.error("Erreur lors de l'initialisation des lits"); }
    finally { setInitializing(false); }
  };

  useEffect(() => {
    loadLits();
    const interval = setInterval(loadLits, 30000);
    return () => clearInterval(interval);
  }, []);

  const litsFiltres = lits.filter(lit => {
    if (selectedCategorie && lit.categorie !== selectedCategorie) return false;
    if (selectedStatut   && lit.statut    !== selectedStatut)    return false;
    if (searchPatient.trim()) {
      if (!lit.patient_actuel) return false;
      const s = searchPatient.toLowerCase();
      if (!`${lit.patient_actuel.prenom_patient} ${lit.patient_actuel.nom_patient}`.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const grouperParChambre = (litsAGrouper: Lit[]): Chambre[] => {
    const map = new Map<string, Chambre>();
    litsAGrouper.forEach(lit => {
      const nom = lit.numero_lit.startsWith('USIC') ? 'USIC' : lit.numero_lit.split('-')[0];
      if (!map.has(nom)) map.set(nom, { nom, categorie: lit.categorie, capacite: 0, lits: [], etage: lit.etage });
      const chambre = map.get(nom)!;
      chambre.lits.push(lit);
      chambre.capacite = chambre.lits.length;
    });
    return Array.from(map.values()).sort((a, b) => {
      const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
      if (a.categorie !== b.categorie) return (order[a.categorie] || 99) - (order[b.categorie] || 99);
      return a.nom.localeCompare(b.nom);
    });
  };

  const chambres = grouperParChambre(litsFiltres);

  const categorieStats: CategorieStats[] = [...new Set(lits.map(l => l.categorie))].map(cat => {
    const litsC = lits.filter(l => l.categorie === cat);
    return { categorie: cat, total: litsC.length, occupes: litsC.filter(l => l.statut === 'occupe').length, disponibles: litsC.filter(l => l.statut === 'disponible').length };
  });

  const hasActiveFilter = selectedCategorie || selectedStatut || searchPatient.trim();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white shadow-lg">
        <div className="p-4 sm:p-6">

          {/* Titre + actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onBackToDashboard}
                className="flex items-center gap-1.5 bg-white text-[#08C5D1] hover:bg-gray-100 border-0 px-3 py-2 text-sm">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold">Gestion des Lits</h1>
                <p className="text-white/90 text-xs sm:text-sm mt-0.5 hidden sm:block">Suivi en temps réel de l'occupation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lits.length === 0 && (
                <Button variant="outline" onClick={handleInitializeLits} disabled={loading || initializing}
                  className="flex items-center gap-1.5 bg-white text-[#08C5D1] hover:bg-gray-100 border-0 text-sm px-3 py-2">
                  <BedDouble className={`w-4 h-4 ${initializing ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{initializing ? 'Init...' : 'Initialiser'}</span>
                </Button>
              )}
              <Button variant="outline" onClick={loadLits} disabled={loading}
                className="flex items-center gap-1.5 bg-white text-[#08C5D1] hover:bg-gray-100 border-0 text-sm px-3 py-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un patient..." value={searchPatient}
              onChange={e => setSearchPatient(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white text-gray-900 rounded-lg border-2 border-white/50 focus:border-white focus:outline-none placeholder-gray-400 text-sm" />
            {searchPatient && (
              <button onClick={() => setSearchPatient('')} aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards catégories — 2 colonnes sur mobile, 4 sur desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            {categorieStats.map(stat => {
              const rate       = stat.total > 0 ? Math.round((stat.occupes / stat.total) * 100) : 0;
              const isSelected = selectedCategorie === stat.categorie;
              return (
                <Card key={stat.categorie} onClick={() => setSelectedCategorie(isSelected ? null : stat.categorie)}
                  className={`bg-white border-2 ${isSelected ? 'border-white ring-2 ring-white scale-105' : 'border-white/50'} shadow-lg hover:shadow-xl transition-all cursor-pointer`}>
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Layers className="w-4 h-4 text-[#08C5D1] shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-gray-900 truncate">{getCategorieLabel(stat.categorie)}</h3>
                        <p className="text-[10px] text-gray-500 truncate hidden sm:block">{getCategorieDescription(stat.categorie)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                      <div className="text-center bg-gray-50 rounded p-1">
                        <p className="font-bold text-[#08C5D1]">{stat.occupes}</p>
                        <p className="text-gray-500 text-[10px]">Occupés</p>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-1">
                        <p className="font-bold text-gray-700">{stat.disponibles}</p>
                        <p className="text-gray-500 text-[10px]">Libres</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#08C5D1] rounded-full transition-all duration-500" style={{ width: `${rate}%` }} />
                    </div>
                    <p className="text-[10px] text-center mt-1 font-bold text-gray-600">{rate}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filtres statut — toggle sur mobile */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowFilters(o => !o)}
              className="sm:hidden flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
              <Filter className="w-4 h-4" />
              Statut
              {selectedStatut && <span className="w-2 h-2 bg-white rounded-full ml-1" />}
            </button>

            <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex items-center gap-2 flex-wrap`}>
              <div className="hidden sm:flex items-center gap-2 text-white">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-semibold">Statut:</span>
              </div>
              {[
                { label: 'Tous',        value: null          },
                { label: 'Libres',      value: 'disponible'  },
                { label: 'Occupés',     value: 'occupe'      },
                { label: 'Maintenance', value: 'maintenance' },
              ].map(({ label, value }) => (
                <Button key={label} variant="outline" onClick={() => setSelectedStatut(value)}
                  className={`${selectedStatut === value ? 'bg-white text-[#08C5D1] ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'} border-0 text-xs sm:text-sm px-3 py-1.5`}>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Compteur + reset */}
          <div className="text-white/90 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <span>{litsFiltres.length} lit{litsFiltres.length > 1 ? 's' : ''}</span>
            {hasActiveFilter && (
              <button onClick={() => { setSelectedCategorie(null); setSelectedStatut(null); setSearchPatient(''); }}
                className="underline hover:text-white flex items-center gap-1">
                <X className="w-3 h-3" />Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-3 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#08C5D1] mx-auto mb-4" />
              <p className="text-gray-600">Chargement des lits...</p>
            </div>
          </div>
        ) : lits.length === 0 ? (
          <div className="text-center py-20">
            <BedDouble className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun lit configuré</h3>
            <p className="text-gray-500 mb-6">Cliquez sur "Initialiser les lits" pour créer les 20 lits de CENHOSOA</p>
          </div>
        ) : litsFiltres.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat</h3>
            <p className="text-gray-500">Aucun lit ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {chambres.map(chambre => (
              <motion.div key={chambre.nom}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all">

                {/* Header chambre */}
                <div className="bg-gradient-to-r from-[#08C5D1]/10 to-[#08C5D1]/5 p-3 sm:p-4 border-b-2 border-[#08C5D1]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#08C5D1]" />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base">Chambre {chambre.nom}</h3>
                        <p className="text-xs text-gray-600">{chambre.capacite} lit{chambre.capacite > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#08C5D1]/10 text-[#08C5D1] border border-[#08C5D1]/30 text-xs">
                      Cat. {chambre.categorie}
                    </Badge>
                  </div>
                </div>

                {/* Lits */}
                <div className="p-3 sm:p-4 space-y-3">
                  {chambre.lits.map(lit => {
                    const isOccupe = lit.statut === 'occupe' && lit.patient_actuel;
                    return (
                      <div key={lit.id_lit}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          isOccupe ? 'border-cyan-300 shadow-sm shadow-cyan-100' : 'border-gray-200 bg-gray-50'
                        }`}>
                        {isOccupe && <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500 w-full" />}

                        <div className={`p-3 ${isOccupe ? 'bg-white' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bed className={`w-4 h-4 ${isOccupe ? 'text-cyan-500' : 'text-gray-400'}`} />
                              <span className="font-bold text-sm text-gray-800">{getLitLabel(lit)}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                              isOccupe
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : lit.statut === 'disponible'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {lit.statut === 'disponible' ? 'LIBRE' : lit.statut === 'occupe' ? 'OCCUPÉ' : lit.statut.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mb-2">{getTypeLit(lit.categorie)}</p>

                          {isOccupe && lit.patient_actuel ? (
                            <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-2.5">
                              <div className="flex items-start gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                  {lit.patient_actuel.prenom_patient?.charAt(0)}{lit.patient_actuel.nom_patient?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-gray-900 truncate">
                                    {lit.patient_actuel.prenom_patient} {lit.patient_actuel.nom_patient}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {lit.patient_actuel.age} ans • {lit.patient_actuel.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-cyan-500 shrink-0" />
                                    <span className="text-xs text-cyan-700 font-semibold">
                                      {formatDuration(lit.patient_actuel.duree_occupation_heures)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-1.5">
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>Disponible pour admission</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}