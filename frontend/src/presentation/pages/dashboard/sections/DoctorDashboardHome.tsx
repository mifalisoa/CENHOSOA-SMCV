// frontend/src/presentation/pages/dashboard/sections/DoctorDashboardHome.tsx

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, ChevronRight, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { usePatients }    from '../../../hooks/usePatients';
import { useRendezVous }  from '../../../hooks/useRendezVous';
import { useAuth }        from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { Badge }          from '../../../components/common/Badge';

export function DoctorDashboardHome() {
  const { user }   = useAuth();
  const { patients } = usePatients();
  const { rendezVous, fetchByDate, loading: loadingRdv } = useRendezVous();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchByDate(today, user?.id_user);
  }, [today, user?.id_user, fetchByDate]);

  const stats = useMemo(() => {
    const total        = (patients || []).length;
    const externes     = (patients || []).filter(p => p.statut_patient === 'externe').length;
    const hospitalises = (patients || []).filter(p => p.statut_patient === 'hospitalise').length;
    const rdvAujourd   = (rendezVous || []).length;
    const confirmes    = (rendezVous || []).filter(r => r.statut_rdv === 'confirme').length;
    const planifies    = (rendezVous || []).filter(r => r.statut_rdv === 'planifie').length;
    return { total, externes, hospitalises, rdvAujourd, confirmes, planifies };
  }, [patients, rendezVous]);

  const rdvTries = useMemo(() =>
    [...(rendezVous || [])]
      .filter(r => r.statut_rdv !== 'annule')
      .sort((a, b) => (a.heure_rdv ?? '').localeCompare(b.heure_rdv ?? ''))
      .slice(0, 6),
    [rendezVous]
  );

  const recentPatients = useMemo(() =>
    [...(patients || [])]
      .sort((a, b) => new Date(b.date_enregistrement).getTime() - new Date(a.date_enregistrement).getTime())
      .slice(0, 5),
    [patients]
  );

  const getStatutBadge = (statut: string): 'success' | 'warning' | 'info' | 'default' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
      confirme: 'success', planifie: 'warning', termine: 'default', absent: 'info',
    };
    return map[statut] ?? 'default';
  };

  const getStatutLabel = (statut: string) => ({
    confirme: 'Confirmé', planifie: 'En attente', termine: 'Terminé', annule: 'Annulé', absent: 'Absent',
  } as Record<string, string>)[statut] ?? statut;

  return (
    <div className="space-y-4 sm:space-y-8">

      {/* KPI Cards — 1 colonne sur mobile, 3 sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {[
          { icon: Users,        color: 'blue',  value: stats.total,       label: 'Patients',          sub: `${stats.externes} ext. · ${stats.hospitalises} hosp.` },
          { icon: Calendar,     color: 'cyan',  value: stats.rdvAujourd,  label: "RDV aujourd'hui",   sub: `${stats.confirmes} confirmés · ${stats.planifies} en attente` },
          { icon: CheckCircle2, color: 'green', value: stats.confirmes,   label: 'Confirmés',         sub: `sur ${stats.rdvAujourd} RDV ce jour` },
        ].map(({ icon: Icon, color, value, label, sub }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{value}</div>
                <div className="text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* RDV du jour */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />Rendez-vous du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRdv ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : rdvTries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun rendez-vous aujourd'hui</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {rdvTries.map(rdv => (
                  <div key={rdv.id_rdv} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-14 sm:w-16 text-center shrink-0">
                      <div className="font-bold text-xs sm:text-sm text-cyan-600">{rdv.heure_rdv}</div>
                      <div className="text-[10px] text-gray-400">{rdv.duree_estimee ?? 30} min</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                        {rdv.patient_nom ?? '—'} {rdv.patient_prenom ?? ''}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{rdv.motif_rdv ?? rdv.type_rdv}</div>
                    </div>
                    <Badge variant={getStatutBadge(rdv.statut_rdv)} className="text-[10px] sm:text-xs shrink-0">
                      {getStatutLabel(rdv.statut_rdv)}
                    </Badge>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients récents */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />Patients récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun patient enregistré</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentPatients.map(patient => (
                  <div key={patient.id_patient}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {patient.prenom_patient?.charAt(0)}{patient.nom_patient?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                        {patient.nom_patient} {patient.prenom_patient}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {patient.statut_patient === 'externe' ? 'Externe' : 'Hospitalisé'}
                        {patient.num_dossier && ` · ${patient.num_dossier}`}
                      </div>
                    </div>
                    {patient.statut_patient === 'hospitalise'
                      ? <XCircle   className="w-4 h-4 text-cyan-500 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
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

export default DoctorDashboardHome;