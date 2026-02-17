import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '../../../components/common/Card';

interface SecretaryDashboardStatsProps {
  onNewAppointment: () => void;
  onViewPlanning: () => void;
}

export function SecretaryDashboardStats({ onNewAppointment, onViewPlanning }: SecretaryDashboardStatsProps) {
  const stats = [
    {
      title: "RDV Aujourd'hui",
      value: 24,
      subtitle: "Rendez-vous planifiés",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "RDV En Attente",
      value: 8,
      subtitle: "À confirmer",
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Docteurs Disponibles",
      value: 5,
      subtitle: "Sur 8 total",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Créneaux Libres",
      value: 12,
      subtitle: "Cette semaine",
      icon: CalendarDays,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}