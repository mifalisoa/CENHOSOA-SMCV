// frontend/src/presentation/pages/dashboard/sections/admin/DashboardHome.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }           from 'framer-motion';
import { useNavigate }                       from 'react-router-dom';
import {
  Heart, Activity, Zap, Clock, Waves, Radio, Stethoscope,
  ChevronDown, BedDouble, CheckCircle2, Calendar, AlertTriangle,
  ArrowLeft, ChevronLeft, ChevronRight, Search, RefreshCw,
  Loader2, User, FileText, X,
} from 'lucide-react';
import { httpClient } from '../../../../../infrastructure/http/axios.config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  hospitalises: { cardiologie: number; usic: number; ecg: number; ecg_dii_long: number; ett: number; eto: number };
  externes:     { consultations: number; ecg: number; ecg_dii_long: number; ett: number; eto: number };
  lits: {
    cardiologie: { libres: number; total: number };
    usic:        { libres: number; total: number };
  };
}

interface DetailPatient {
  id_patient:      number;
  nom_patient:     string;
  prenom_patient:  string;
  num_dossier:     string;
  numero_lit?:     string;
  medecin_nom?:    string;
  medecin_prenom?: string;
  heure_soin?:     string;
  realise_par?:    string;
  verifie?:        boolean;
  heure_rdv?:      string;
  statut_rdv?:     string;
}

type CardType =
  | 'cardiologie' | 'usic'
  | 'hosp_ecg' | 'hosp_ecg_dii_long' | 'hosp_ett' | 'hosp_eto'
  | 'consultations'
  | 'ext_ecg' | 'ext_ecg_dii_long' | 'ext_ett' | 'ext_eto';

interface ColorConfig {
  text: string; border: string; borderActive: string; icon: string; iconBg: string;
  badgeBg: string; badgeText: string; badgeIcon: string; panelBg: string; panelBorder: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getColorClasses = (color: string): ColorConfig => {
  const configs: Record<string, ColorConfig> = {
    cyan: {
      text: 'text-cyan-600', border: 'border-cyan-200', borderActive: 'border-cyan-500',
      icon: 'text-cyan-500', iconBg: 'bg-cyan-50',
      badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-600', badgeIcon: 'text-cyan-500',
      panelBg: 'bg-cyan-50', panelBorder: 'border-cyan-200',
    },
    red: {
      text: 'text-red-500', border: 'border-red-300', borderActive: 'border-red-500',
      icon: 'text-red-500', iconBg: 'bg-red-50',
      badgeBg: 'bg-red-50', badgeText: 'text-red-600', badgeIcon: 'text-red-500',
      panelBg: 'bg-red-50', panelBorder: 'border-red-200',
    },
    gray: {
      text: 'text-gray-500', border: 'border-gray-200', borderActive: 'border-gray-400',
      icon: 'text-gray-400', iconBg: 'bg-gray-50',
      badgeBg: 'bg-gray-50', badgeText: 'text-gray-500', badgeIcon: 'text-gray-400',
      panelBg: 'bg-gray-50', panelBorder: 'border-gray-200',
    },
  };
  return configs[color] || configs.gray;
};

const CARD_LABELS: Record<CardType, string> = {
  cardiologie:        'Cardiologie — Conventionnelle',
  usic:               'USIC — Soins Intensifs',
  hosp_ecg:           'ECG — Hospitalisés',
  hosp_ecg_dii_long:  'ECG DII Long — Hospitalisés',
  hosp_ett:           'ETT — Hospitalisés',
  hosp_eto:           'ETO — Hospitalisés',
  consultations:      'Consultations externes',
  ext_ecg:            'ECG — Patients externes',
  ext_ecg_dii_long:   'ECG DII Long — Patients externes',
  ext_ett:            'ETT — Patients externes',
  ext_eto:            'ETO — Patients externes',
};

// ─── Contenu du panneau détail (partagé mobile/desktop) ───────────────────────

function DetailPanelContent({ type, color, onClose, isMobile }: {
  type: CardType; color: string; onClose: () => void; isMobile: boolean;
}) {
  const navigate    = useNavigate();
  const colors      = getColorClasses(color);
  const isAdmission = type === 'cardiologie' || type === 'usic';
  const today       = new Date().toISOString().split('T')[0];

  const [patients,    setPatients]    = useState<DetailPatient[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [currentDate, setCurrentDate] = useState(today);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await httpClient.get(`/dashboard/detail/${type}`, { params: { date: currentDate } });
      setPatients(response.data.data || []);
    } catch { setPatients([]); }
    finally  { setLoading(false); }
  }, [type, currentDate]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const filtered = patients.filter(p =>
    `${p.nom_patient} ${p.prenom_patient} ${p.num_dossier}`.toLowerCase().includes(search.toLowerCase())
  );

  const goToPrev = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d.toISOString().split('T')[0]); };
  const goToNext = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d.toISOString().split('T')[0]); };
  const formatDt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(d));
  const isToday  = currentDate === today;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {!isMobile && (
            <>
              <button onClick={onClose} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 shrink-0">
                <ArrowLeft className="w-4 h-4" />Retour
              </button>
              <div className="h-4 w-px bg-gray-300 shrink-0" />
            </>
          )}
          <h3 className={`text-xs sm:text-sm font-bold ${colors.text} truncate`}>{CARD_LABELS[type]}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isAdmission && (
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 px-1.5 py-1">
              <button onClick={goToPrev} aria-label="Jour précédent" className="p-0.5 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-1">{formatDt(currentDate)}</span>
              <button onClick={goToNext} aria-label="Jour suivant" className="p-0.5 hover:bg-gray-100 rounded">
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          )}
          {!isToday && !isAdmission && (
            <button onClick={() => setCurrentDate(today)}
              className="text-xs font-semibold text-cyan-600 bg-white border border-cyan-200 px-2 py-1 rounded-lg">
              Auj.
            </button>
          )}
          <button onClick={loadDetail} title="Actualiser" className="p-1.5 hover:bg-white rounded-lg">
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white border ${colors.border} ${colors.text}`}>
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-400" />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 text-center">
          <FileText className="w-8 h-8 text-gray-200" />
          <p className="text-sm font-bold text-gray-400">Aucun patient</p>
        </div>
      ) : (
        <div className={`space-y-2 overflow-y-auto pr-1 ${isMobile ? 'max-h-[50vh]' : 'max-h-72'}`}>
          {filtered.map((p, idx) => (
            <motion.div key={`${p.id_patient}-${idx}`}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
              onClick={() => navigate(`/patients/${p.id_patient}/dossier`)}
              className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-cyan-200 hover:shadow-sm transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 ${colors.iconBg} rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${colors.text}`}>
                  {p.nom_patient.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.nom_patient} {p.prenom_patient}</p>
                  <p className="text-xs text-gray-400">#{p.num_dossier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(type === 'cardiologie' || type === 'usic') && p.numero_lit && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <BedDouble className="w-3 h-3" /><span className="font-semibold">{p.numero_lit}</span>
                  </div>
                )}
                {(type.includes('ecg') || type.includes('ett') || type.includes('eto')) && p.heure_soin && (
                  <span className="text-xs font-semibold text-gray-600">{p.heure_soin}</span>
                )}
                {type === 'consultations' && p.heure_rdv && (
                  <span className="text-xs font-bold text-cyan-600">{p.heure_rdv}</span>
                )}
                <User className="w-3.5 h-3.5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── DetailPanel desktop (inline) ─────────────────────────────────────────────

function DetailPanelDesktop({ type, color, onClose }: { type: CardType; color: string; onClose: () => void }) {
  const colors = getColorClasses(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className={`${colors.panelBg} border ${colors.panelBorder} rounded-2xl p-4 mt-3`}
    >
      <DetailPanelContent type={type} color={color} onClose={onClose} isMobile={false} />
    </motion.div>
  );
}

// ─── DetailPanel mobile (bottom sheet) ────────────────────────────────────────

function DetailPanelMobile({ type, color, onClose }: { type: CardType; color: string; onClose: () => void }) {
  const colors = getColorClasses(color);
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative bg-white rounded-t-2xl shadow-2xl z-10"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header de la sheet avec titre + fermer */}
        <div className={`flex items-center justify-between px-4 py-3 ${colors.panelBg} border-b ${colors.panelBorder}`}>
         <h2 className={`text-sm font-bold ${colors.text}`}>{CARD_LABELS[type]}</h2>
         <button 
            onClick={onClose} 
            title="Fermer" 
            aria-label="Fermer la fenêtre"
            className="p-1.5 bg-white/60 hover:bg-white rounded-lg transition-colors"
            >
            <X className="w-4 h-4 text-gray-500" />
         </button>
       </div>

        {/* Contenu */}
        <div className={`${colors.panelBg} p-4`}>
          <DetailPanelContent type={type} color={color} onClose={onClose} isMobile={true} />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const container   = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType; label: string; subtitle: string;
  count: number; details: string; color: string;
  badge: { icon: React.ElementType; text: string } | null;
  bedInfo?: string; cardType: CardType; isActive: boolean; onClick: () => void;
}

function StatCard({ icon: Icon, label, subtitle, count, details, color, badge, bedInfo, isActive, onClick }: StatCardProps) {
  const colors    = getColorClasses(color);
  const BadgeIcon = badge?.icon;

  return (
    <motion.div variants={itemVariant}>
      <div onClick={onClick}
        className={`bg-white rounded-2xl border-2 p-3 sm:p-4 h-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${
          isActive ? `${colors.borderActive} shadow-md` : colors.border
        }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${colors.icon}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm font-bold ${colors.text} truncate leading-tight`}>{label}</p>
              <p className="text-[10px] text-gray-400 truncate leading-tight hidden sm:block">{subtitle}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-180 ' + colors.text : 'text-gray-300'}`} />
        </div>

        <div className="mb-1">
          <span className={`text-3xl sm:text-5xl font-black leading-none ${isActive ? colors.text : 'text-gray-900'}`}>{count}</span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-gray-500 mb-2 flex-1 leading-tight">{details}</p>

        {bedInfo && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1.5">
            <BedDouble className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{bedInfo}</span>
          </div>
        )}

        {badge && BadgeIcon && (
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg ${colors.badgeBg} w-fit`}>
            <BadgeIcon className={`w-3 h-3 ${colors.badgeIcon}`} />
            <span className={`text-[10px] font-semibold ${colors.badgeText}`}>{badge.text}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Hook responsive ──────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

// ─── DashboardHome ────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const isMobile = useIsMobile();

  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeCard,   setActiveCard]   = useState<CardType | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await httpClient.get('/dashboard/stats');
      setStats(response.data.data);
    } catch { setStats(null); }
    finally  { setLoadingStats(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleCardClick = (type: CardType) => setActiveCard(prev => prev === type ? null : type);

  const h    = stats?.hospitalises;
  const e    = stats?.externes;
  const lits = stats?.lits;

  const cardsHospitalises: StatCardProps[] = [
    { icon: Heart,       label: 'Cardiologie',  subtitle: 'Conventionnelle',         count: h?.cardiologie  ?? 0, details: 'patients hospitalisés',     color: 'cyan', badge: null,                                              bedInfo: lits ? `${lits.cardiologie.libres}/${lits.cardiologie.total} lits` : '—', cardType: 'cardiologie',       isActive: activeCard === 'cardiologie',       onClick: () => handleCardClick('cardiologie')       },
    { icon: Activity,    label: 'USIC',          subtitle: 'Soins Intensifs',         count: h?.usic         ?? 0, details: 'soins intensifs',             color: 'red',  badge: null,                                              bedInfo: lits ? `${lits.usic.libres}/${lits.usic.total} lits` : '—',             cardType: 'usic',              isActive: activeCard === 'usic',              onClick: () => handleCardClick('usic')              },
    { icon: Zap,         label: 'ECG',           subtitle: 'Électrocardiogramme',     count: h?.ecg          ?? 0, details: "examens aujourd'hui",         color: 'cyan', badge: { icon: CheckCircle2, text: 'Service actif' },     cardType: 'hosp_ecg',          isActive: activeCard === 'hosp_ecg',          onClick: () => handleCardClick('hosp_ecg')          },
    { icon: Clock,       label: 'ECG DII Long',  subtitle: 'Enregistrement continu',  count: h?.ecg_dii_long ?? 0, details: 'enregistrements en cours',    color: 'gray', badge: { icon: Clock, text: 'Durée : 24h' },              cardType: 'hosp_ecg_dii_long', isActive: activeCard === 'hosp_ecg_dii_long', onClick: () => handleCardClick('hosp_ecg_dii_long') },
    { icon: Waves,       label: 'ETT',           subtitle: 'Écho Transthoracique',    count: h?.ett          ?? 0, details: 'examens planifiés',            color: 'cyan', badge: { icon: Calendar, text: 'Planning actif' },        cardType: 'hosp_ett',          isActive: activeCard === 'hosp_ett',          onClick: () => handleCardClick('hosp_ett')          },
    { icon: Radio,       label: 'ETO',           subtitle: 'Écho Transoesophagienne', count: h?.eto          ?? 0, details: 'examens avancés',              color: 'gray', badge: { icon: AlertTriangle, text: 'Expertise req.' },   cardType: 'hosp_eto',          isActive: activeCard === 'hosp_eto',          onClick: () => handleCardClick('hosp_eto')          },
  ];

  const cardsExternes: StatCardProps[] = [
    { icon: Stethoscope, label: 'Consultations', subtitle: 'Patients externes',       count: e?.consultations ?? 0, details: "rendez-vous aujourd'hui",  color: 'cyan', badge: { icon: Activity,      text: 'En cours' },          cardType: 'consultations',    isActive: activeCard === 'consultations',    onClick: () => handleCardClick('consultations')    },
    { icon: Zap,         label: 'ECG',           subtitle: 'Électrocardiogramme',     count: e?.ecg           ?? 0, details: "examens aujourd'hui",       color: 'cyan', badge: { icon: CheckCircle2,  text: 'Disponible' },        cardType: 'ext_ecg',          isActive: activeCard === 'ext_ecg',          onClick: () => handleCardClick('ext_ecg')          },
    { icon: Clock,       label: 'ECG DII Long',  subtitle: 'Enregistrement 24h',      count: e?.ecg_dii_long  ?? 0, details: 'examens planifiés',          color: 'gray', badge: { icon: Calendar,      text: 'Planning actif' },    cardType: 'ext_ecg_dii_long', isActive: activeCard === 'ext_ecg_dii_long', onClick: () => handleCardClick('ext_ecg_dii_long') },
    { icon: Waves,       label: 'ETT',           subtitle: 'Écho Transthoracique',    count: e?.ett           ?? 0, details: 'examens planifiés',          color: 'cyan', badge: { icon: Calendar,      text: 'Planning actif' },    cardType: 'ext_ett',          isActive: activeCard === 'ext_ett',          onClick: () => handleCardClick('ext_ett')          },
    { icon: Radio,       label: 'ETO',           subtitle: 'Écho Transoesophagienne', count: e?.eto           ?? 0, details: 'examens avancés',             color: 'gray', badge: { icon: AlertTriangle, text: 'Expertise req.' },   cardType: 'ext_eto',          isActive: activeCard === 'ext_eto',          onClick: () => handleCardClick('ext_eto')          },
  ];

  const getActiveColor = () => [...cardsHospitalises, ...cardsExternes].find(c => c.cardType === activeCard)?.color ?? 'cyan';
  const activeInHosp   = activeCard && cardsHospitalises.some(c => c.cardType === activeCard);
  const activeInExt    = activeCard && cardsExternes.some(c => c.cardType === activeCard);

  return (
    <div className="space-y-6 p-3 sm:p-6">

      {/* Actualiser */}
      <div className="flex justify-end">
        <button onClick={loadStats} disabled={loadingStats}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-cyan-500' : ''}`} />
          <span className="hidden sm:inline">{loadingStats ? 'Actualisation...' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Patients Hospitalisés */}
      <section>
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
            <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-gray-800">Patients Hospitalisés</h2>
        </div>
        <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-3 sm:p-4">
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {cardsHospitalises.map(card => <StatCard key={card.cardType} {...card} />)}
          </motion.div>
          {/* Desktop — inline sous la grille */}
          {!isMobile && (
            <AnimatePresence>
              {activeInHosp && activeCard && (
                <DetailPanelDesktop type={activeCard} color={getActiveColor()} onClose={() => setActiveCard(null)} />
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Séparateur */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-gray-300 text-xs">•••</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Patients Externes */}
      <section>
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
            <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-gray-800">Patients Externes</h2>
        </div>
        <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-3 sm:p-4">
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {cardsExternes.map(card => <StatCard key={card.cardType} {...card} />)}
          </motion.div>
          {/* Desktop — inline sous la grille */}
          {!isMobile && (
            <AnimatePresence>
              {activeInExt && activeCard && (
                <DetailPanelDesktop type={activeCard} color={getActiveColor()} onClose={() => setActiveCard(null)} />
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Mobile — bottom sheet global pour les deux sections */}
      {isMobile && (
        <AnimatePresence>
          {activeCard && (
            <DetailPanelMobile type={activeCard} color={getActiveColor()} onClose={() => setActiveCard(null)} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}