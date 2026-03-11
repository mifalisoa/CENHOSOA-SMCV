import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bed,
  Clock,
  CheckCircle,
  ChevronLeft,
  BedDouble,
  Layers,
  Loader2,
  RefreshCw,
  Home,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar, AvatarFallback } from '../common/Avatar';
import { toast } from 'sonner';
import { httpClient } from '../../../infrastructure/http/axios.config';

interface LitManagementProps {
  onBackToDashboard: () => void;
}

interface Patient {
  id_patient: number;
  nom_patient: string;
  prenom_patient: string;
  age: number;
  sexe_patient: string;
  diagnostic: string;
  date_admission: Date;
  duree_occupation_heures: number;
}

interface Lit {
  id_lit: number;
  numero_lit: string;
  categorie: string;
  statut: string;
  etage?: string;
  batiment?: string;
  patient_actuel?: Patient;
}

interface Chambre {
  nom: string;
  categorie: string;
  capacite: number;
  lits: Lit[];
  etage?: string;
}

interface CategorieStats {
  categorie: string;
  total: number;
  occupes: number;
  disponibles: number;
}

export function LitManagement({ onBackToDashboard }: LitManagementProps) {
  const [lits, setLits] = useState<Lit[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<string | null>(null);
  const [searchPatient, setSearchPatient] = useState('');

  // Charger les lits depuis l'API
  const loadLits = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/lits');
      setLits(response.data);
    } catch (error) {
      console.error('Erreur chargement lits:', error);
      toast.error('Erreur lors du chargement des lits');
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les lits
  const handleInitializeLits = async () => {
    try {
      setInitializing(true);
      await httpClient.post('/lits/initialiser');
      toast.success('20 lits CENHOSOA initialisés avec succès');
      await loadLits();
    } catch (error) {
      console.error('Erreur initialisation:', error);
      toast.error('Erreur lors de l\'initialisation des lits');
    } finally {
      setInitializing(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadLits();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadLits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrer les lits
  const litsFiltres = lits.filter(lit => {
    // Filtre par catégorie
    if (selectedCategorie && lit.categorie !== selectedCategorie) {
      return false;
    }

    // Filtre par statut
    if (selectedStatut && lit.statut !== selectedStatut) {
      return false;
    }

    // Recherche patient
    if (searchPatient.trim() !== '') {
      if (!lit.patient_actuel) return false;
      
      const searchLower = searchPatient.toLowerCase();
      const nomComplet = `${lit.patient_actuel.prenom_patient} ${lit.patient_actuel.nom_patient}`.toLowerCase();
      
      if (!nomComplet.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // Grouper les lits par chambre
  const grouperParChambre = (litsAGrouper: Lit[]): Chambre[] => {
    const chambresMap = new Map<string, Chambre>();

    litsAGrouper.forEach(lit => {
      // Extraire le nom de la chambre du numero_lit
      let nomChambre: string;
      
      if (lit.numero_lit.startsWith('USIC')) {
        nomChambre = 'USIC';
      } else {
        // Exemple: "416-1" -> "416"
        nomChambre = lit.numero_lit.split('-')[0];
      }

      if (!chambresMap.has(nomChambre)) {
        chambresMap.set(nomChambre, {
          nom: nomChambre,
          categorie: lit.categorie,
          capacite: 0,
          lits: [],
          etage: lit.etage,
        });
      }

      const chambre = chambresMap.get(nomChambre)!;
      chambre.lits.push(lit);
      chambre.capacite = chambre.lits.length;
    });

    // Convertir en array et trier
    return Array.from(chambresMap.values()).sort((a, b) => {
      // Trier par catégorie puis par nom
      if (a.categorie !== b.categorie) {
        const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
        return (order[a.categorie] || 99) - (order[b.categorie] || 99);
      }
      return a.nom.localeCompare(b.nom);
    });
  };

  const chambres = grouperParChambre(litsFiltres);

  // Calculer les statistiques par catégorie
  const categorieStats: CategorieStats[] = [];
  const categoriesUniques = [...new Set(lits.map(l => l.categorie))];
  
  categoriesUniques.forEach(cat => {
    const litsCategorie = lits.filter(l => l.categorie === cat);
    categorieStats.push({
      categorie: cat,
      total: litsCategorie.length,
      occupes: litsCategorie.filter(l => l.statut === 'occupe').length,
      disponibles: litsCategorie.filter(l => l.statut === 'disponible').length,
    });
  });

  const getLitStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'occupe': return 'bg-[#08C5D1]/10 text-[#08C5D1] border-[#08C5D1]/30';
      case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'reserve': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategorieLabel = (categorie: string) => {
    switch (categorie) {
      case '1': return 'Catégorie 1';
      case '2': return 'Catégorie 2';
      case '3': return 'Catégorie 3';
      case 'USIC': return 'USIC';
      default: return categorie;
    }
  };

  const getCategorieDescription = (categorie: string) => {
    switch (categorie) {
      case '1': return 'Chambres Individuelles';
      case '2': return 'Chambres Doubles';
      case '3': return 'Chambre Quadruple';
      case 'USIC': return 'Soins Intensifs';
      default: return '';
    }
  };

  const getLitLabel = (lit: Lit, chambre: Chambre): string => {
    const num = lit.numero_lit.split('-')[1];
    return `Lit N°${num}`;
  };

  const getTypeLit = (categorie: string): string => {
    switch (categorie) {
      case '1': return 'VIP';
      case '2': return 'Standard';
      case '3': return 'Standard';
      case 'USIC': return 'Soins Intensifs';
      default: return 'Standard';
    }
  };

  const formatDuration = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}j ${remainingHours}h`;
    }
    return `${remainingHours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 bg-white text-[#08C5D1] hover:bg-gray-100 border-0"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gestion des Lits</h1>
                <p className="text-white/90 mt-1">Suivi en temps réel de l'occupation des lits</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lits.length === 0 && (
                <Button
                  variant="outline"
                  onClick={handleInitializeLits}
                  disabled={loading || initializing}
                  className="flex items-center gap-2 bg-white text-[#08C5D1] hover:bg-gray-100 border-0"
                >
                  <BedDouble className={`w-4 h-4 ${initializing ? 'animate-pulse' : ''}`} />
                  {initializing ? 'Initialisation...' : 'Initialiser les lits'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={loadLits}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-[#08C5D1] hover:bg-gray-100 border-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Filtres */}
          <div className="space-y-4">
            {/* Recherche patient */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un patient par nom..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-white/50 focus:border-white focus:outline-none placeholder-gray-400"
              />
              {searchPatient && (
                <button
                  onClick={() => setSearchPatient('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtres par catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {categorieStats.map(stat => {
                const occupancyRate = stat.total > 0 ? Math.round((stat.occupes / stat.total) * 100) : 0;
                const isSelected = selectedCategorie === stat.categorie;
                return (
                  <Card 
                    key={stat.categorie}
                    onClick={() => setSelectedCategorie(isSelected ? null : stat.categorie)}
                    className={`bg-white border-2 ${isSelected ? 'border-white ring-2 ring-white scale-105' : 'border-white/50'} shadow-lg hover:shadow-xl transition-all cursor-pointer`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-[#08C5D1]" />
                        <div>
                          <h3 className="font-bold text-sm text-gray-900">{getCategorieLabel(stat.categorie)}</h3>
                          <p className="text-xs text-gray-600">{getCategorieDescription(stat.categorie)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="text-center bg-gray-50 rounded p-1">
                          <p className="font-bold text-[#08C5D1]">{stat.occupes}</p>
                          <p className="text-gray-600">Occupés</p>
                        </div>
                        <div className="text-center bg-gray-50 rounded p-1">
                          <p className="font-bold text-gray-700">{stat.disponibles}</p>
                          <p className="text-gray-600">Libres</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#08C5D1] rounded-full transition-all duration-500"
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-1 font-bold text-gray-600">{occupancyRate}%</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filtres par statut */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-white">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-semibold">Statut:</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedStatut(null)}
                className={`${!selectedStatut ? 'bg-white text-[#08C5D1] ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'} border-0 text-sm`}
              >
                Tous
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedStatut('disponible')}
                className={`${selectedStatut === 'disponible' ? 'bg-white text-emerald-600 ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'} border-0 text-sm`}
              >
                Libres
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedStatut('occupe')}
                className={`${selectedStatut === 'occupe' ? 'bg-white text-[#08C5D1] ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'} border-0 text-sm`}
              >
                Occupés
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedStatut('maintenance')}
                className={`${selectedStatut === 'maintenance' ? 'bg-white text-orange-600 ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'} border-0 text-sm`}
              >
                Maintenance
              </Button>
            </div>

            {/* Résultats */}
            <div className="text-white/90 text-sm">
              {litsFiltres.length} lit{litsFiltres.length > 1 ? 's' : ''} trouvé{litsFiltres.length > 1 ? 's' : ''}
              {(selectedCategorie || selectedStatut || searchPatient) && (
                <button
                  onClick={() => {
                    setSelectedCategorie(null);
                    setSelectedStatut(null);
                    setSearchPatient('');
                  }}
                  className="ml-3 underline hover:text-white"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Vue par chambre */}
      <div className="p-6">
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
            <p className="text-gray-500 mb-6">
              Cliquez sur "Initialiser les lits" pour créer les 20 lits de CENHOSOA
            </p>
          </div>
        ) : litsFiltres.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat</h3>
            <p className="text-gray-500">Aucun lit ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chambres.map(chambre => (
              <motion.div
                key={chambre.nom}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all"
              >
                {/* Header de la chambre */}
                <div className="bg-gradient-to-r from-[#08C5D1]/10 to-[#08C5D1]/5 p-4 border-b-2 border-[#08C5D1]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-[#08C5D1]" />
                      <div>
                        <h3 className="font-bold text-lg">Chambre {chambre.nom}</h3>
                        <p className="text-xs text-gray-600">Capacité: {chambre.capacite} lit{chambre.capacite > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#08C5D1]/10 text-[#08C5D1] border border-[#08C5D1]/30 text-xs">
                      Cat. {chambre.categorie}
                    </Badge>
                  </div>
                </div>

                {/* Lits de la chambre */}
                <div className="p-4 space-y-3">
                  {chambre.lits.map(lit => (
                    <div 
                      key={lit.id_lit}
                      className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:border-[#08C5D1]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-[#08C5D1]" />
                          <span className="font-semibold text-sm">{getLitLabel(lit, chambre)}</span>
                        </div>
                        <Badge className={`${getLitStatusColor(lit.statut)} text-xs font-semibold uppercase px-2 py-0.5`}>
                          {lit.statut === 'disponible' ? 'LIBRE' : lit.statut.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600 mb-2">{getTypeLit(lit.categorie)}</p>

                      {lit.patient_actuel && lit.statut === 'occupe' ? (
                        <div className="bg-white rounded p-2 border border-[#08C5D1]/20">
                          <div className="flex items-start gap-2">
                            <Avatar className="w-8 h-8 border-2 border-[#08C5D1]/30">
                              <AvatarFallback className="bg-[#08C5D1]/10 text-[#08C5D1] text-xs font-semibold">
                                {lit.patient_actuel.prenom_patient?.charAt(0)}{lit.patient_actuel.nom_patient?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">
                                {lit.patient_actuel.prenom_patient} {lit.patient_actuel.nom_patient}
                              </p>
                              <p className="text-xs text-gray-600">
                                {lit.patient_actuel.age} ans • {lit.patient_actuel.sexe_patient === 'M' ? 'M' : 'F'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{formatDuration(lit.patient_actuel.duree_occupation_heures)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3" />
                            <span>Lit disponible pour admission</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}