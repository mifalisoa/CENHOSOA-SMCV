import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Zap, 
  Clock, 
  Waves, 
  Radio, 
  Stethoscope, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '../../../../components/common/Card';

export default function DashboardHome() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // ✅ AJOUT DES DONNÉES - Patients Hospitalisés (6 KPIs)
  const patientsHospitalises = [
    {
      icon: Heart,
      label: "Cardiologie",
      subtitle: "Service principal",
      count: 1,
      details: "patients hospitalisés",
      color: "cyan",
      action: "Voir +",
      link: "Lits: 0 / 10 libres"
    },
    {
      icon: Activity,
      label: "USIC",
      subtitle: "Soins intensifs",
      count: 0,
      details: "patients en soins intensifs",
      color: "red",
      action: "Voir les lits +",
      link: "lits: 0 / 8 libres"
    },
    {
      icon: Zap,
      label: "ECG",
      subtitle: "Électrocardiogramme",
      count: 0,
      details: "examens aujourd'hui",
      color: "cyan",
      action: "Service actif",
      link: null
    },
    {
      icon: Clock,
      label: "ECG DII Long",
      subtitle: "Enregistrement en cours",
      count: 0,
      details: "enregistrements en cours",
      color: "gray",
      action: "Ouvrir DII",
      link: null
    },
    {
      icon: Waves,
      label: "ETT",
      subtitle: "Échocardiographie",
      count: 0,
      details: "examens planifiés",
      color: "cyan",
      action: "Planning actif",
      link: null
    },
    {
      icon: Radio,
      label: "ETO",
      subtitle: "Écho transœsophagienne",
      count: 0,
      details: "examens avancés",
      color: "gray",
      action: "Examins œuv. +",
      link: null
    }
  ];

  // ✅ AJOUT DES DONNÉES - Patients Externes (5 KPIs)
  const patientsExternes = [
    {
      icon: Stethoscope,
      label: "Consultations",
      subtitle: "Rendez-vous externes",
      count: 0,
      details: "rendez-vous aujourd'hui",
      color: "cyan",
      action: "Consultation en cours",
      link: null
    },
    {
      icon: Zap,
      label: "ECG",
      subtitle: "Électrocardiogramme",
      count: 0,
      details: "examens aujourd'hui",
      color: "cyan",
      action: "Service disponible",
      link: null
    },
    {
      icon: Clock,
      label: "ECG DII Long",
      subtitle: "Enregistrement Holter",
      count: 0,
      details: "examens planifiés",
      color: "gray",
      action: "Planning actif",
      link: null
    },
    {
      icon: Waves,
      label: "ETT",
      subtitle: "Échocardiographie",
      count: 0,
      details: "examens planifiés",
      color: "cyan",
      action: "Planning actif",
      link: null
    },
    {
      icon: Radio,
      label: "ETO",
      subtitle: "Écho transœsophagienne",
      count: 0,
      details: "examens avancés",
      color: "gray",
      action: "Examins œuv. +",
      link: null
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'text-cyan-600', iconBg: 'bg-white' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600', iconBg: 'bg-white' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: 'text-gray-500', iconBg: 'bg-white' }
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-10 p-6">
      
      {/* SECTION 1: Patients Hospitalisés (6 colonnes) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Patients Hospitalisés</h2>
        </div>

        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {patientsHospitalises.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={item}>
                <Card className={`h-full hover:shadow-xl cursor-pointer border-2 ${colors.border} ${colors.bg} hover:scale-105 transition-all`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
                      </div>
                      <span className="text-gray-400">⌄</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className={`font-bold text-xs sm:text-sm ${colors.text}`}>{stat.label}</h3>
                      <p className="text-[10px] text-gray-500">{stat.subtitle}</p>
                      <div className="my-3"><span className="text-4xl font-black text-gray-900">{stat.count}</span></div>
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{stat.details}</p>
                      {stat.link && <div className="text-[10px] text-gray-500 bg-white/60 p-1.5 rounded border border-dashed border-gray-200">🛏️ {stat.link}</div>}
                      <button className={`text-[10px] font-bold ${colors.text} mt-4 uppercase tracking-tighter`}>{stat.action} →</button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* SECTION 2: Patients Externes (5 colonnes) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Patients Externes</h2>
        </div>

        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {patientsExternes.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={item}>
                <Card className={`h-full hover:shadow-xl cursor-pointer border-2 ${colors.border} ${colors.bg} hover:scale-105 transition-all`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
                      </div>
                      <span className="text-gray-400">⌄</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className={`font-bold text-xs sm:text-sm ${colors.text}`}>{stat.label}</h3>
                      <p className="text-[10px] text-gray-500">{stat.subtitle}</p>
                      <div className="my-3"><span className="text-4xl font-black text-gray-900">{stat.count}</span></div>
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{stat.details}</p>
                      <button className={`text-[10px] font-bold ${colors.text} mt-4 uppercase tracking-tighter`}>{stat.action} →</button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}