// frontend/src/presentation/pages/dashboard/sections/SecretaryDashboardHome.tsx

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Users, CalendarDays,
  Plus, ArrowRight, CheckCircle2, XCircle,
  Loader2, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast }      from 'sonner';

interface Stats {
  rdvAujourdhui:        number;
  rdvEnAttente:         number;
  rdvConfirmes:         number;
  rdvAnnules:           number;
  totalPatients:        number;
  patientsExternes:     number;
  patientsHospitalises: number;
}

interface RdvRecent {
  id_rdv:          number;
  heure_rdv:       string;
  patient_nom?:    string;
  patient_prenom?: string;
  type_rdv:        string;
  statut_rdv:      string;
  motif_rdv?:      string;
}

interface SecretaryDashboardHomeProps { onGoToPlanning: () => void; }

const STATUT_LABEL: Record<string, string> = {
  planifie: 'En attente', confirme: 'Confirmé',
  termine: 'Terminé', annule: 'Annulé', absent: 'Absent',
};

const STATUT_COLOR: Record<string, string> = {
  planifie: 'text-orange-600 bg-orange-50 border-orange-200',
  confirme: 'text-cyan-600   bg-cyan-50   border-cyan-200',
  termine:  'text-gray-600   bg-gray-50   border-gray-200',
  annule:   'text-red-600    bg-red-50    border-red-200',
  absent:   'text-yellow-600 bg-yellow-50 border-yellow-200',
};

export default function SecretaryDashboardHome({ onGoToPlanning }: SecretaryDashboardHomeProps) {
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [rdvDuJour, setRdvDuJour] = useState<RdvRecent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [rdvRes, patientsRes] = await Promise.all([
        httpClient.get('/rendez-vous',  { params: { date: today } }),
        httpClient.get('/patients',     { params: { limit: 1000 } }),
      ]);
      const rdvList      = rdvRes.data.data      ?? rdvRes.data      ?? [];
      const patientsList = patientsRes.data.data ?? [];
      const pagination   = patientsRes.data.pagination ?? {};

      setStats({
        rdvAujourdhui:        rdvList.length,
        rdvEnAttente:         rdvList.filter((r: RdvRecent) => r.statut_rdv === 'planifie').length,
        rdvConfirmes:         rdvList.filter((r: RdvRecent) => r.statut_rdv === 'confirme').length,
        rdvAnnules:           rdvList.filter((r: RdvRecent) => r.statut_rdv === 'annule').length,
        totalPatients:        pagination.total ?? patientsList.length,
        patientsExternes:     patientsList.filter((p: { statut_patient: string }) => p.statut_patient === 'externe').length,
        patientsHospitalises: patientsList.filter((p: { statut_patient: string }) => p.statut_patient === 'hospitalise').length,
      });

      setRdvDuJour(
        [...rdvList]
          .filter((r: RdvRecent) => r.statut_rdv !== 'annule')
          .sort((a: RdvRecent, b: RdvRecent) => (a.heure_rdv ?? '').localeCompare(b.heure_rdv ?? ''))
          .slice(0, 6)
      );
    } catch {
      setError('Impossible de charger les données');
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally { setLoading(false); }
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const kpis = stats ? [
    { icon: Calendar,     color: 'bg-cyan-500',   value: stats.rdvAujourdhui, label: "RDV Aujourd'hui", sub: `${stats.rdvConfirmes} confirmés` },
    { icon: Clock,        color: 'bg-orange-500', value: stats.rdvEnAttente,  label: 'En attente',       sub: 'À confirmer'                     },
    { icon: CalendarDays, color: 'bg-red-500',    value: stats.rdvAnnules,    label: 'Annulés',          sub: "Aujourd'hui"                     },
    { icon: Users,        color: 'bg-blue-500',   value: stats.totalPatients, label: 'Patients',         sub: `${stats.patientsExternes} ext. · ${stats.patientsHospitalises} hosp.` },
  ] : [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="text-gray-500 text-sm">Chargement...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <XCircle className="w-12 h-12 text-red-400" />
      <p className="text-gray-600 font-medium">{error}</p>
      <button onClick={loadData}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700">
        <RefreshCw className="w-4 h-4" />Réessayer
      </button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8">

      {/* En-tête — empilé sur mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            }).format(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button onClick={onGoToPlanning}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-cyan-100">
            <Plus className="w-4 h-4" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — 2 colonnes sur mobile, 4 sur desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="hover:shadow-lg transition-shadow border border-gray-100">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 ${kpi.color} rounded-xl flex items-center justify-center shadow-sm`}>
                    <kpi.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{kpi.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-0.5">{kpi.label}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">{kpi.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* RDV du jour */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                Rendez-vous du jour
              </CardTitle>
              <button onClick={onGoToPlanning}
                className="text-xs text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {rdvDuJour.length === 0 ? (
              <div className="text-center py-8 sm:py-10 text-gray-400">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm font-medium">Aucun rendez-vous aujourd'hui</p>
                <button onClick={onGoToPlanning} className="mt-3 text-xs text-cyan-600 font-semibold hover:underline">
                  Planifier un RDV →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {rdvDuJour.map(rdv => (
                  <div key={rdv.id_rdv} onClick={onGoToPlanning}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all cursor-pointer">
                    <div className="w-12 sm:w-14 text-center shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-cyan-600">{rdv.heure_rdv}</span>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {rdv.patient_nom ?? '—'} {rdv.patient_prenom ?? ''}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {rdv.motif_rdv ?? rdv.type_rdv ?? 'Consultation'}
                      </p>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shrink-0 ${STATUT_COLOR[rdv.statut_rdv] ?? 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                      {STATUT_LABEL[rdv.statut_rdv] ?? rdv.statut_rdv}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}