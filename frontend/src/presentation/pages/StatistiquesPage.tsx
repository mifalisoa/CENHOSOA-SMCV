// frontend/src/presentation/pages/StatistiquesPage.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Users, Bed, Calendar, Activity,
  Heart, Stethoscope, FileText, ClipboardList, BarChart3,
  PieChart, ArrowLeft, RefreshCw, FileSpreadsheet, FileDown, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../infrastructure/http/axios.config';
import {
  LineChart, Line, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { toast } from 'sonner';
import { exportStatsToPDF, exportStatsToExcel } from '../../infrastructure/utils/statsExport';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistoriquePoint { date: string; count?: number; total?: number; nouveaux?: number; taux?: number }
interface StatutCount     { statut: string; count: number }
interface TypeCount       { type: string;   count: number }
interface LitCategorie    { categorie: string; total: number; occupes: number; libres: number }

interface Stats {
  patients: {
    total: number; externes: number; hospitalises: number; sortis: number;
    nouveaux_mois: number; evolution: number;
    historique: HistoriquePoint[];
  };
  lits: {
    total: number; occupes: number; libres: number; maintenance: number;
    taux_occupation: number;
    par_categorie: LitCategorie[];
    historique: HistoriquePoint[];
  };
  rendez_vous: {
    total_mois: number; aujourdhui: number; semaine: number;
    par_statut: StatutCount[];
    par_type:   TypeCount[];
    historique: HistoriquePoint[];
  };
  admissions: {
    total_mois: number; en_cours: number; terminees: number;
    duree_moyenne: number;
    historique: HistoriquePoint[];
  };
  documents: {
    observations: number; bilans: number; soins_medicaux: number;
    soins_infirmiers: number; traitements: number; comptes_rendus: number; total: number;
  };
}

// ── Constantes visuelles ──────────────────────────────────────────────────────

const CYAN    = '#08C5D1';
const GREEN   = '#10B981';
const AMBER   = '#F59E0B';
const RED     = '#EF4444';
const BLUE    = '#3B82F6';
const PIE_COLORS = [CYAN, GREEN, AMBER, RED, BLUE];

// ── Composant ─────────────────────────────────────────────────────────────────

export default function StatistiquesPage() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [periode,   setPeriode]   = useState<'semaine' | 'mois' | 'trimestre' | 'annee'>('mois');
  const [exporting, setExporting] = useState(false);

  // ✅ useCallback — satisfait exhaustive-deps
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await httpClient.get(`/stats?periode=${periode}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('❌ [Statistiques] Erreur:', error);
      setLoadError('Impossible de charger les statistiques.');
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!stats) return;
    try {
      setExporting(true);
      const exportData = {
        periode,
        date_generation: new Date().toLocaleString('fr-FR'),
        patients:     stats.patients,
        lits:         stats.lits,
        rendez_vous:  stats.rendez_vous,
        admissions:   stats.admissions,
        documents:    stats.documents,
      };
      if (format === 'pdf') {
        exportStatsToPDF(exportData);
        toast.success('PDF généré');
      } else {
        exportStatsToExcel(exportData);
        toast.success('Excel généré');
      }
    } catch {
      toast.error(`Erreur lors de l'export ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  // ── Tooltip commun ────────────────────────────────────────────────────────

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '12px',
    },
  };

  // ── États de chargement / erreur ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (loadError || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl border border-gray-200 shadow p-10 max-w-md">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 text-sm mb-6">{loadError}</p>
          <button onClick={loadStats}
            className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />Réessayer
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header — cyan uniforme ── */}
      <div className="bg-cyan-600 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-cyan-100 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Statistiques & Analyses</h1>
                  <p className="text-cyan-100 text-sm">Tableau de bord analytique — CENHOSOA</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={loadStats} disabled={loading}
                className="flex items-center gap-2 bg-white text-cyan-600 px-3 py-2 rounded-lg font-semibold hover:bg-cyan-50 transition-colors disabled:opacity-50 text-sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button onClick={() => handleExport('pdf')} disabled={exporting}
                className="flex items-center gap-2 bg-white text-cyan-600 px-3 py-2 rounded-lg font-semibold hover:bg-cyan-50 transition-colors disabled:opacity-50 text-sm">
                <FileDown className="w-4 h-4" />PDF
              </button>
              <button onClick={() => handleExport('excel')} disabled={exporting}
                className="flex items-center gap-2 bg-white text-cyan-600 px-3 py-2 rounded-lg font-semibold hover:bg-cyan-50 transition-colors disabled:opacity-50 text-sm">
                <FileSpreadsheet className="w-4 h-4" />Excel
              </button>
            </div>
          </div>

          {/* Sélecteur période */}
          <div className="flex gap-2">
            {(['semaine', 'mois', 'trimestre', 'annee'] as const).map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all capitalize ${
                  periode === p ? 'bg-white text-cyan-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}>
                {p === 'annee' ? 'Année' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Patients */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-cyan-50 rounded-lg">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                stats.patients.evolution >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {stats.patients.evolution >= 0
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />
                }
                {Math.abs(stats.patients.evolution)}%
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Patients</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stats.patients.total}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-cyan-600 font-medium">{stats.patients.hospitalises} hosp.</span>
              <span className="text-gray-400">{stats.patients.externes} ext.</span>
            </div>
          </div>

          {/* Lits */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-cyan-50 rounded-lg">
                <Bed className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Occupation</p>
                <p className={`text-xl font-bold ${
                  stats.lits.taux_occupation > 80 ? 'text-red-500'
                    : stats.lits.taux_occupation > 60 ? 'text-amber-500'
                    : 'text-cyan-600'
                }`}>{stats.lits.taux_occupation}%</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Gestion des Lits</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stats.lits.occupes}/{stats.lits.total}</p>
            <span className="text-xs text-green-600 font-medium">{stats.lits.libres} disponibles</span>
          </div>

          {/* RDV */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-cyan-50 rounded-lg">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Cette semaine</p>
                <p className="text-xl font-bold text-cyan-600">{stats.rendez_vous.semaine}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Rendez-vous</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stats.rendez_vous.total_mois}</p>
            <span className="text-xs text-cyan-600 font-medium">{stats.rendez_vous.aujourdhui} aujourd'hui</span>
          </div>

          {/* Admissions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-cyan-50 rounded-lg">
                <Activity className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Durée moy.</p>
                <p className="text-xl font-bold text-cyan-600">{stats.admissions.duree_moyenne}j</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Admissions</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stats.admissions.en_cours}</p>
            <span className="text-xs text-gray-400 font-medium">{stats.admissions.terminees} terminées</span>
          </div>
        </div>

        {/* ── Graphiques courbes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Évolution patients */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Évolution des Patients (30j)</h3>
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            {stats.patients.historique.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Pas encore de données sur cette période
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.patients.historique}>
                  <defs>
                    <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CYAN} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="total" stroke={CYAN} strokeWidth={2}
                    fillOpacity={1} fill="url(#gradPatients)" name="Total" />
                  <Line type="monotone" dataKey="nouveaux" stroke={GREEN} strokeWidth={2}
                    dot={{ r: 3 }} name="Nouveaux" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Taux occupation lits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Taux d'Occupation Lits (30j)</h3>
              <Bed className="w-5 h-5 text-cyan-600" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.lits.historique}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" domain={[0, 100]} />
                <Tooltip {...tooltipStyle} formatter={(v) => typeof v === "number" ? `${v}%` : v} />
                <Line type="monotone" dataKey="taux" stroke={CYAN} strokeWidth={2.5}
                  dot={{ r: 3, fill: CYAN }} activeDot={{ r: 5 }} name="Taux %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Pie + Bar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pie — types RDV */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Répartition Types de RDV</h3>
              <PieChart className="w-5 h-5 text-cyan-600" />
            </div>
            {stats.rendez_vous.par_type.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Aucun rendez-vous</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <RechartsPie>
                  <Pie data={stats.rendez_vous.par_type} cx="50%" cy="50%"
                    outerRadius={95} dataKey="count" nameKey="type"
                    label={(e) => `${e.name}: ${((e.percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {stats.rendez_vous.par_type.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar — RDV par statut */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Rendez-vous par Statut</h3>
              <Calendar className="w-5 h-5 text-cyan-600" />
            </div>
            {stats.rendez_vous.par_statut.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Aucun rendez-vous</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.rendez_vous.par_statut} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis dataKey="statut" type="category" tick={{ fontSize: 11 }} stroke="#d1d5db" width={80} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill={CYAN} radius={[0, 6, 6, 0]} name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Bar lits + historique admissions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Bar — lits par catégorie */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Occupation Lits par Catégorie</h3>
              <BarChart3 className="w-5 h-5 text-cyan-600" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.lits.par_categorie}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="categorie" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="occupes" fill={CYAN}    name="Occupés"    radius={[6, 6, 0, 0]} />
                <Bar dataKey="libres"  fill="#E5E7EB" name="Disponibles" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area — admissions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Admissions (30j)</h3>
              <Activity className="w-5 h-5 text-cyan-600" />
            </div>
            {stats.admissions.historique.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Pas encore de données</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.admissions.historique}>
                  <defs>
                    <linearGradient id="gradAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GREEN} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2}
                    fillOpacity={1} fill="url(#gradAdm)" name="Admissions" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Documents médicaux ── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">
              Documents Médicaux
              <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                {stats.documents.total} total
              </span>
            </h3>
            <FileText className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: ClipboardList, label: 'Observations',    value: stats.documents.observations     },
              { icon: Activity,      label: 'Bilans',          value: stats.documents.bilans            },
              { icon: Stethoscope,   label: 'Soins médicaux',  value: stats.documents.soins_medicaux   },
              { icon: Heart,         label: 'Soins infirmiers', value: stats.documents.soins_infirmiers },
              { icon: FileText,      label: 'Traitements',     value: stats.documents.traitements       },
              { icon: FileSpreadsheet, label: 'Comptes rendus', value: stats.documents.comptes_rendus  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <Icon className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}