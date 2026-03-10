import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CalendarDays, Plus, ListChecks } from 'lucide-react';
import { Card, CardContent } from '../../../components/common/Card';

interface SecretaryDashboardStatsProps {
  onNewAppointment?: () => void; // Rendu optionnel pour plus de flexibilité
  onViewPlanning?: () => void;   // Rendu optionnel
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
      color: "bg-blue-500" // Changé en bleu pour varier
    },
    {
      title: "Créneaux Libres",
      value: 12,
      subtitle: "Cette semaine",
      icon: CalendarDays,
      color: "bg-purple-500" // Changé en violet pour varier
    }
  ];

  return (
    <div className="space-y-6">
      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-inner`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-slate-700 mb-1">{stat.title}</div>
                <div className="text-xs text-slate-400 font-medium">{stat.subtitle}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ✅ Utilisation des props pour corriger les erreurs ESLint/TS */}
      {(onNewAppointment || onViewPlanning) && (
        <div className="flex flex-wrap gap-4">
          {onNewAppointment && (
            <button
              onClick={onNewAppointment}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-cyan-100"
            >
              <Plus size={18} />
              Nouveau Rendez-vous
            </button>
          )}
          {onViewPlanning && (
            <button
              onClick={onViewPlanning}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              <ListChecks size={18} className="text-cyan-600" />
              Voir le Planning
            </button>
          )}
        </div>
      )}
    </div>
  );
}