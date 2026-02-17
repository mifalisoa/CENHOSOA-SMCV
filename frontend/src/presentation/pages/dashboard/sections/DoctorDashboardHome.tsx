import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { usePatients } from '../../../hooks/usePatients';
import { useAppointments } from '../../../hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';

interface DoctorDashboardHomeProps {
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

export function DoctorDashboardHome({ userRole }: DoctorDashboardHomeProps) {
  const { patients } = usePatients();
  const { appointments } = useAppointments();

  // Calcul des statistiques
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = (appointments || []).filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    return {
      totalPatients: (patients || []).length,
      externesCount: (patients || []).filter(p => p.type === 'externe').length,
      hospitalisesCount: (patients || []).filter(p => p.type === 'hospitalise').length,
      todayAppointments: todayAppointments.length,
      confirmedToday: todayAppointments.filter(apt => apt.status === 'confirmed').length
    };
  }, [patients, appointments]);

  // Prochains rendez-vous
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return (appointments || [])
      .filter(apt => new Date(apt.appointmentDate) >= now)
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 5);
  }, [appointments]);

  // Patients récents
  const recentPatients = useMemo(() => {
    return (patients || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [patients]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
      confirmed: 'success',
      pending: 'warning',
      in_progress: 'info',
      completed: 'default'
    };
    return variants[status] || 'default';
  };

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalPatients}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Mes Patients</div>
              <div className="text-xs text-gray-500">
                {stats.externesCount} externes, {stats.hospitalisesCount} hospitalisés
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.todayAppointments}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">RDV aujourd'hui</div>
              <div className="text-xs text-gray-500">
                {stats.confirmedToday} confirmés
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Prochains rendez-vous */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun rendez-vous programmé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="w-16 text-center">
                      <div className="font-semibold text-sm">
                        {new Date(apt.appointmentDate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{apt.patientName}</div>
                      <div className="text-xs text-gray-600">{apt.reason}</div>
                    </div>
                    <Badge variant={getStatusBadge(apt.status)}>
                      {apt.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients récents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Patients récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun patient enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {patient.type === 'externe' ? 'Patient externe' : 'Patient hospitalisé'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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