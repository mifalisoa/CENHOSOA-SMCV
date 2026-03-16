// presentation/pages/dashboard/sections/admin/DashboardHome.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Activity, Zap, Clock, Waves, Radio, Stethoscope,
  ChevronDown, BedDouble, CheckCircle2, Calendar, AlertTriangle,
  ArrowLeft, ChevronLeft, ChevronRight, Search, RefreshCw,
  Loader2, User, FileText,
} from 'lucide-react';
import { httpClient } from '../../../../../infrastructure/http/axios.config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  hospitalises: { cardiologie: number; usic: number; ecg: number; ecg_dii_long: number; ett: number; eto: number };
  externes: { consultations: number; ecg: number; ecg_dii_long: number; ett: number; eto: number };
  lits: {
    cardiologie: { libres: number; total: number };
    usic: { libres: number; total: number };
  };
}

interface DetailPatient {
  id_patient: number;
  nom_patient: string;
  prenom_patient: string;
  num_dossier: string;
  numero_lit?: string;
  date_admission?: string;
  motif_admission?: string;
  medecin_nom?: string;
  medecin_prenom?: string;
  date_soin?: string;
  heure_soin?: string;
  ecg?: string;
  ecg_dii_long?: string;
  ett?: string;
  eto?: string;
  realise_par?: string;
  verifie?: boolean;
  heure_rdv?: string;
  motif_rdv?: string;
  statut_rdv?: string;
}

// ← CORRECTION : types uniques par section avec préfixe hosp_/ext_
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
  const colors: Record<string, ColorConfig> = {
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
  return colors[color] || colors.gray;
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

// ─── Panneau détail ───────────────────────────────────────────────────────────

function DetailPanel({ type, date, color, onClose }: {
  type: CardType; date: string; color: string; onClose: () => void;
}) {
  const navigate = useNavigate();
  const colors = getColorClasses(color);
  const [patients, setPatients] = useState<DetailPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(date);

  const isAdmission = type === 'cardiologie' || type === 'usic';

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await httpClient.get(`/dashboard/detail/${type}`, {
        params: { date: currentDate }
      });
      setPatients(response.data.data || []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [type, currentDate]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const filtered = patients.filter(p =>
    `${p.nom_patient} ${p.prenom_patient} ${p.num_dossier}`.toLowerCase().includes(search.toLowerCase())
  );

  const goToPrevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d.toISOString().split('T')[0]); };
  const goToNextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d.toISOString().split('T')[0]); };
  const formatDate  = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
  const isToday     = currentDate === new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
      className={`${colors.panelBg} border ${colors.panelBorder} rounded-2xl p-4 mt-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />Retour
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h3 className={`text-sm font-bold ${colors.text}`}>{CARD_LABELS[type]}</h3>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmission && (
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 px-2 py-1">
              <button onClick={goToPrevDay} aria-label="Jour précédent" className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)}
                  title="Choisir une date"
                  className="text-xs font-semibold text-gray-700 bg-transparent border-none outline-none cursor-pointer" />
              </div>
              <button onClick={goToNextDay} aria-label="Jour suivant" className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
          {!isToday && !isAdmission && (
            <button onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 bg-white border border-cyan-200 px-2.5 py-1 rounded-lg">
              Aujourd'hui
            </button>
          )}
          <button onClick={loadDetail} title="Actualiser" className="p-1.5 hover:bg-white rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white border ${colors.border} ${colors.text}`}>
            {filtered.length} patient{filtered.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!isAdmission && (
        <p className="text-xs text-gray-400 mb-3 font-medium">Examens du {formatDate(currentDate)}</p>
      )}

      {/* Recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Rechercher par nom, prénom ou numéro..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-400" />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <FileText className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-bold text-gray-400">Aucun patient avec cet examen</p>
          <p className="text-xs text-gray-300">Aucun patient n'a d'examen enregistré pour ce type</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((p, idx) => (
            <motion.div key={`${p.id_patient}-${idx}`}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
              onClick={() => navigate(`/patients/${p.id_patient}/dossier`)}
              className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-cyan-200 hover:shadow-sm transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 ${colors.iconBg} rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${colors.text} group-hover:scale-105 transition-transform`}>
                  {p.nom_patient.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.nom_patient} {p.prenom_patient}</p>
                  <p className="text-xs text-gray-400">#{p.num_dossier}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                {(type === 'cardiologie' || type === 'usic') && (
                  <div className="text-right">
                    {p.numero_lit && <div className="flex items-center gap-1 text-xs text-gray-500"><BedDouble className="w-3.5 h-3.5" /><span className="font-semibold">{p.numero_lit}</span></div>}
                    {p.medecin_nom && <p className="text-xs text-gray-400">Dr. {p.medecin_prenom} {p.medecin_nom}</p>}
                  </div>
                )}
                {(type === 'hosp_ecg' || type === 'hosp_ecg_dii_long' || type === 'hosp_ett' || type === 'hosp_eto' ||
                  type === 'ext_ecg'  || type === 'ext_ecg_dii_long'  || type === 'ext_ett'  || type === 'ext_eto') && (
                  <div className="text-right">
                    {p.heure_soin && <div className="flex items-center gap-1 text-xs font-semibold text-gray-600"><Clock className="w-3.5 h-3.5 text-gray-400" />{p.heure_soin}</div>}
                    {p.realise_par && <p className="text-xs text-gray-400">{p.realise_par}</p>}
                    {p.verifie && <span className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Vérifié</span>}
                  </div>
                )}
                {type === 'consultations' && (
                  <div className="text-right">
                    {p.heure_rdv && <div className="flex items-center gap-1 text-xs font-bold text-cyan-600"><Clock className="w-3.5 h-3.5" />{p.heure_rdv}</div>}
                    {p.statut_rdv && <p className="text-xs text-gray-400">{p.statut_rdv}</p>}
                  </div>
                )}
                <User className="w-4 h-4 text-gray-300 group-hover:text-cyan-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Variants animation ───────────────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType; label: string; subtitle: string;
  count: number; details: string; color: string;
  badge: { icon: React.ElementType; text: string } | null;
  bedInfo?: string; cardType: CardType; isActive: boolean; onClick: () => void;
}

function StatCard({ icon: Icon, label, subtitle, count, details, color, badge, bedInfo, isActive, onClick }: StatCardProps) {
  const colors = getColorClasses(color);
  const BadgeIcon = badge?.icon;

  return (
    <motion.div variants={itemVariant}>
      <div onClick={onClick} className={`bg-white rounded-2xl border-2 p-4 h-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col ${isActive ? `${colors.borderActive} shadow-md` : colors.border}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${colors.icon}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${colors.text} truncate leading-tight`}>{label}</p>
              <p className="text-[11px] text-gray-400 truncate leading-tight">{subtitle}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-180 ' + colors.text : 'text-gray-300'}`} />
        </div>
        <div className="mb-1">
          <span className={`text-5xl font-black leading-none ${isActive ? colors.text : 'text-gray-900'}`}>{count}</span>
        </div>
        <p className="text-[11px] text-gray-500 mb-3 flex-1">{details}</p>
        {bedInfo && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2">
            <BedDouble className="w-3.5 h-3.5 text-gray-400" /><span>{bedInfo}</span>
          </div>
        )}
        {badge && BadgeIcon && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colors.badgeBg} w-fit`}>
            <BadgeIcon className={`w-3.5 h-3.5 ${colors.badgeIcon}`} />
            <span className={`text-[11px] font-semibold ${colors.badgeText}`}>{badge.text}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── DashboardHome ────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await httpClient.get('/dashboard/stats');
      setStats(response.data.data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleCardClick = (type: CardType) => setActiveCard(prev => prev === type ? null : type);

  const h = stats?.hospitalises;
  const e = stats?.externes;
  const lits = stats?.lits;

  // ── Cartes hospitalisés — types uniques avec préfixe hosp_ ──
  const cardsHospitalises: StatCardProps[] = [
    { icon: Heart,      label: 'Cardiologie',    subtitle: 'Conventionnelle',         count: h?.cardiologie  ?? 0, details: 'patients hospitalisés',     color: 'cyan', badge: null,                                              bedInfo: lits ? `${lits.cardiologie.libres} lit libre / ${lits.cardiologie.total}` : '—', cardType: 'cardiologie',       isActive: activeCard === 'cardiologie',       onClick: () => handleCardClick('cardiologie')       },
    { icon: Activity,   label: 'USIC',            subtitle: 'Soins Intensifs',         count: h?.usic         ?? 0, details: 'patients en soins intensifs', color: 'red',  badge: null,                                              bedInfo: lits ? `${lits.usic.libres} lit libre / ${lits.usic.total}` : '—',              cardType: 'usic',              isActive: activeCard === 'usic',              onClick: () => handleCardClick('usic')              },
    { icon: Zap,        label: 'ECG',             subtitle: 'Électrocardiogramme',     count: h?.ecg          ?? 0, details: "examens aujourd'hui",         color: 'cyan', badge: { icon: CheckCircle2, text: 'Service actif' },     cardType: 'hosp_ecg',          isActive: activeCard === 'hosp_ecg',          onClick: () => handleCardClick('hosp_ecg')          },
    { icon: Clock,      label: 'ECG DII Long',    subtitle: 'Enregistrement continu',  count: h?.ecg_dii_long ?? 0, details: 'enregistrements en cours',    color: 'gray', badge: { icon: Clock, text: 'Durée : 24h' },              cardType: 'hosp_ecg_dii_long', isActive: activeCard === 'hosp_ecg_dii_long', onClick: () => handleCardClick('hosp_ecg_dii_long') },
    { icon: Waves,      label: 'ETT',             subtitle: 'Écho Transthoracique',    count: h?.ett          ?? 0, details: 'examens planifiés',            color: 'cyan', badge: { icon: Calendar, text: 'Planning actif' },        cardType: 'hosp_ett',          isActive: activeCard === 'hosp_ett',          onClick: () => handleCardClick('hosp_ett')          },
    { icon: Radio,      label: 'ETO',             subtitle: 'Écho Transoesophagienne', count: h?.eto          ?? 0, details: 'examens avancés',              color: 'gray', badge: { icon: AlertTriangle, text: 'Expertise requise' }, cardType: 'hosp_eto',          isActive: activeCard === 'hosp_eto',          onClick: () => handleCardClick('hosp_eto')          },
  ];

  // ── Cartes externes — types uniques avec préfixe ext_ ──
  const cardsExternes: StatCardProps[] = [
    { icon: Stethoscope, label: 'Consultations', subtitle: 'Patients externes',        count: e?.consultations ?? 0, details: "rendez-vous aujourd'hui",  color: 'cyan', badge: { icon: Activity, text: 'Consultations en cours' },  cardType: 'consultations',    isActive: activeCard === 'consultations',    onClick: () => handleCardClick('consultations')    },
    { icon: Zap,         label: 'ECG',           subtitle: 'Électrocardiogramme',      count: e?.ecg           ?? 0, details: "examens aujourd'hui",       color: 'cyan', badge: { icon: CheckCircle2, text: 'Service disponible' },   cardType: 'ext_ecg',          isActive: activeCard === 'ext_ecg',          onClick: () => handleCardClick('ext_ecg')          },
    { icon: Clock,       label: 'ECG DII Long',  subtitle: 'Enregistrement 24h',       count: e?.ecg_dii_long  ?? 0, details: 'examens planifiés',          color: 'gray', badge: { icon: Calendar, text: 'Planning actif' },            cardType: 'ext_ecg_dii_long', isActive: activeCard === 'ext_ecg_dii_long', onClick: () => handleCardClick('ext_ecg_dii_long') },
    { icon: Waves,       label: 'ETT',           subtitle: 'Écho Transthoracique',     count: e?.ett           ?? 0, details: 'examens planifiés',          color: 'cyan', badge: { icon: Calendar, text: 'Planning actif' },            cardType: 'ext_ett',          isActive: activeCard === 'ext_ett',          onClick: () => handleCardClick('ext_ett')          },
    { icon: Radio,       label: 'ETO',           subtitle: 'Écho Transoesophagienne',  count: e?.eto           ?? 0, details: 'examens avancés',             color: 'gray', badge: { icon: AlertTriangle, text: 'Expertise requise' },   cardType: 'ext_eto',          isActive: activeCard === 'ext_eto',          onClick: () => handleCardClick('ext_eto')          },
  ];

  const getActiveColor = (): string => {
    const allCards = [...cardsHospitalises, ...cardsExternes];
    return allCards.find(c => c.cardType === activeCard)?.color ?? 'cyan';
  };

  const activeInHospitalises = activeCard && cardsHospitalises.some(c => c.cardType === activeCard);
  const activeInExternes     = activeCard && cardsExternes.some(c => c.cardType === activeCard);

  return (
    <div className="space-y-8 p-6">

      <div className="flex justify-end">
        <button onClick={loadStats} disabled={loadingStats}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-cyan-500' : ''}`} />
          {loadingStats ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Patients Hospitalisés */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            <BedDouble className="w-4 h-4 text-cyan-600" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Patients Hospitalisés</h2>
        </div>
        <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-4">
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cardsHospitalises.map((card) => <StatCard key={card.cardType} {...card} />)}
          </motion.div>
          <AnimatePresence>
            {activeInHospitalises && activeCard && (
              <DetailPanel type={activeCard} date={today} color={getActiveColor()} onClose={() => setActiveCard(null)} />
            )}
          </AnimatePresence>
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-cyan-600" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Patients Externes</h2>
        </div>
        <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-4">
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cardsExternes.map((card) => <StatCard key={card.cardType} {...card} />)}
          </motion.div>
          <AnimatePresence>
            {activeInExternes && activeCard && (
              <DetailPanel type={activeCard} date={today} color={getActiveColor()} onClose={() => setActiveCard(null)} />
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}