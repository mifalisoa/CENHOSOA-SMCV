// frontend/src/presentation/pages/rendez-vous/PlanningPage.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Users,
  Filter,
  Eye,
  ArrowLeft,
  Loader2,
  UserX,
  RefreshCw,
  ChevronDown,
  X,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Pencil,
  Clock,
  User,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';
import { useRendezVous } from '../../hooks/useRendezVous';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../infrastructure/http/axios.config';
import NouveauRdvModal from '../../components/rendez-vous/NouveauRdvModal';
import type { RendezVous } from '../../../core/entities/RendezVous';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Docteur {
  id_user: number;
  nom: string;
  prenom: string;
  specialite: string;
}

type FilterStatut = 'tous' | 'confirme' | 'planifie' | 'annule' | 'termine' | 'absent';
type FilterType   = 'tous' | 'consultation' | 'controle' | 'urgence' | 'suivi';

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const TYPE_COLORS: Record<string, string> = {
  consultation: 'bg-cyan-500',
  controle:     'bg-green-500',
  urgence:      'bg-red-500',
  suivi:        'bg-orange-500',
};

const TYPE_COLORS_HEX: Record<string, string> = {
  consultation: '#06b6d4',
  controle:     '#22c55e',
  urgence:      '#ef4444',
  suivi:        '#f97316',
};

const STATUT_OPTIONS = [
  { value: 'tous',     label: 'Tous les statuts' },
  { value: 'confirme', label: 'Confirmé'         },
  { value: 'planifie', label: 'En attente'        },
  { value: 'annule',   label: 'Annulé'            },
  { value: 'termine',  label: 'Terminé'           },
  { value: 'absent',   label: 'Absent'            },
];

const TYPE_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'tous',         label: 'Tous les types' },
  { value: 'consultation', label: 'Consultation'   },
  { value: 'controle',     label: 'Contrôle'       },
  { value: 'urgence',      label: 'Urgence'        },
  { value: 'suivi',        label: 'Suivi'          },
];

const STATUT_LABEL: Record<string, string> = {
  planifie: 'En attente',
  confirme: 'Confirmé',
  termine:  'Terminé',
  annule:   'Annulé',
  absent:   'Absent',
};

const TYPE_LABEL: Record<string, string> = {
  consultation: 'Consultation',
  controle:     'Contrôle',
  urgence:      'Urgence',
  suivi:        'Suivi',
};



// ─── Génération ticket PDF ────────────────────────────────────────────────────

function generateTicketPDF(rdv: RendezVous, docteurNom: string) {
  const color = TYPE_COLORS_HEX[rdv.type_rdv ?? 'consultation'] ?? '#06b6d4';
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(rdv.date_rdv as string));

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Ticket RDV - ${rdv.patient_nom} ${rdv.patient_prenom}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: flex-start; padding: 20px; }
    .ticket { width: 400px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
    .header { background: ${color}; color: white; padding: 24px; text-align: center; }
    .header .hospital { font-size: 11px; font-weight: 600; letter-spacing: 2px; opacity: 0.85; text-transform: uppercase; margin-bottom: 4px; }
    .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 2px; }
    .header .subtitle { font-size: 12px; opacity: 0.8; }
    .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 24px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .info-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; margin-bottom: 6px; }
    .info-icon { font-size: 16px; width: 20px; text-align: center; }
    .info-label { font-size: 11px; color: #64748b; min-width: 80px; }
    .info-value { font-size: 13px; font-weight: 700; color: #1e293b; }
    .highlight-row { background: ${color}15; border: 1.5px solid ${color}40; }
    .highlight-row .info-value { color: ${color}; font-size: 18px; }
    .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    .motif-box { background: #f1f5f9; border-radius: 10px; padding: 12px; font-size: 13px; color: #475569; font-style: italic; line-height: 1.5; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; }
    .footer .rdv-id { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
    .footer .notice { font-size: 11px; color: #64748b; line-height: 1.5; }
    .footer .notice strong { color: ${color}; }
    .barcode { display: flex; justify-content: center; gap: 2px; margin: 10px 0; }
    .barcode div { width: 2px; background: #cbd5e1; }
    @media print { body { background: white; padding: 0; } .ticket { box-shadow: none; border-radius: 0; width: 100%; } }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="hospital">CENHOSOA — Service Cardiologie</div>
      <h1>Rendez-vous Medical</h1>
      <div class="subtitle">Confirmation de rendez-vous</div>
      <div class="badge">${TYPE_LABEL[rdv.type_rdv ?? 'consultation'] ?? rdv.type_rdv}</div>
    </div>
    <div class="body">
      <div class="section">
        <div class="section-title">Patient</div>
        <div class="info-row">
          <span class="info-icon">&#x1F194;</span>
          <span class="info-label">Nom complet</span>
          <span class="info-value">${rdv.patient_nom ?? '—'} ${rdv.patient_prenom ?? ''}</span>
        </div>
        ${rdv.patient_age ? `<div class="info-row"><span class="info-icon">&#x1F382;</span><span class="info-label">Age</span><span class="info-value">${rdv.patient_age} ans</span></div>` : ''}
      </div>
      <div class="section">
        <div class="section-title">Rendez-vous</div>
        <div class="info-row highlight-row">
          <span class="info-icon">&#x1F4C5;</span>
          <span class="info-label">Date</span>
          <span class="info-value" style="font-size:14px;text-transform:capitalize">${dateFormatee}</span>
        </div>
        <div class="info-row highlight-row">
          <span class="info-icon">&#x23F0;</span>
          <span class="info-label">Heure</span>
          <span class="info-value">${rdv.heure_rdv}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">&#x23F1;</span>
          <span class="info-label">Duree</span>
          <span class="info-value">${rdv.duree_estimee ?? 30} minutes</span>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Medecin</div>
        <div class="info-row">
          <span class="info-icon">&#x1F468;&#x200D;&#x2695;&#xFE0F;</span>
          <span class="info-label">Medecin</span>
          <span class="info-value">Dr. ${docteurNom}</span>
        </div>
      </div>
      ${rdv.motif_rdv ? `<div class="divider"></div><div class="section"><div class="section-title">Motif de consultation</div><div class="motif-box">${rdv.motif_rdv}</div></div>` : ''}
    </div>
    <div class="footer">
      <div class="rdv-id">N RDV : #${String(rdv.id_rdv).padStart(6, '0')} &bull; ${STATUT_LABEL[rdv.statut_rdv] ?? rdv.statut_rdv}</div>
      <div class="barcode">${Array.from({ length: 30 }, (_, i) => `<div style="height:${20 + (i % 3) * 8}px"></div>`).join('')}</div>
      <div class="notice">Merci de vous presenter <strong>15 minutes avant</strong> votre rendez-vous.<br/>Munissez-vous de ce ticket et de votre piece d'identite.</div>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=500,height=800');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ─── Mini calendrier ─────────────────────────────────────────────────────────

function MiniCalendar({ value, onChange, onClose }: {
  value: Date; onChange: (d: Date) => void; onClose: () => void;
}) {
  const [displayed, setDisplayed] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const year = displayed.getFullYear();
  const month = displayed.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(displayed);
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isSelected = (d: number) => value.getFullYear() === year && value.getMonth() === month && value.getDate() === d;
  const isToday    = (d: number) => { const t = new Date(); return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; };

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setDisplayed(new Date(year, month - 1, 1))} aria-label="Mois précédent" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</span>
        <button onClick={() => setDisplayed(new Date(year, month + 1, 1))} aria-label="Mois suivant" className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => (
          <div key={idx} className="aspect-square">
            {day && <button onClick={() => { onChange(new Date(year, month, day)); onClose(); }}
              className={`w-full h-full rounded-lg text-xs font-semibold transition-all ${
                isSelected(day) ? 'bg-cyan-500 text-white shadow-md' :
                isToday(day)    ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' :
                'hover:bg-gray-100 text-gray-700'
              }`}>{day}</button>}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
        <button onClick={() => { onChange(new Date()); onClose(); }} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">Aujourd'hui</button>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><X className="w-3 h-3" /> Fermer</button>
      </div>
    </div>
  );
}

// ─── FilterDropdown ───────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({ label, options, value, onChange }: {
  label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const current = options.find(o => o.value === value);
  const isFiltered = value !== 'tous';
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
          isFiltered ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
        }`}>
        <span>{isFiltered ? current?.label : label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-gray-100 shadow-xl py-1 min-w-[160px]">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${
                value === opt.value ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StatutBadge ──────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: string }) {
  const map = {
    'confirme': { cls: 'bg-white/90 text-cyan-700',     label: 'Confirmé'   },
    'planifie': { cls: 'bg-white/90 text-gray-700',     label: 'En attente' },
    'termine':  { cls: 'bg-white/90 text-green-700',    label: 'Terminé'    },
    'annule':   { cls: 'bg-white/90 text-red-700',      label: 'Annulé'     },
    'absent':   { cls: 'bg-yellow-100 text-yellow-800', label: 'Absent'     },
  };
  const { cls, label } = map[statut as keyof typeof map] ?? { cls: 'bg-white/90 text-gray-600', label: statut };
  return <span className={`px-2 py-0.5 ${cls} text-[10px] rounded font-semibold whitespace-nowrap`}>{label}</span>;
}

// ─── Modal détail RDV ─────────────────────────────────────────────────────────

function RdvDetailModal({
  rdv,
  docteurNom,
  onClose,
  onRefresh,
  onEdit,
  onOpenDossier,
}: {
  rdv: RendezVous;
  docteurNom: string;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: (rdv: RendezVous) => void;
  onOpenDossier: (patientId: number) => void;
}) {
  const [loading, setLoading] = useState<'confirme' | 'annule' | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const bgColor = TYPE_COLORS[rdv.type_rdv ?? 'consultation'] ?? 'bg-cyan-500';
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(rdv.date_rdv as string));

  const canConfirm = rdv.statut_rdv === 'planifie';
  const canCancel  = rdv.statut_rdv !== 'annule' && rdv.statut_rdv !== 'termine';
  const canEdit    = rdv.statut_rdv !== 'annule' && rdv.statut_rdv !== 'termine';

  const handleConfirm = async () => {
    setLoading('confirme');
    try {
      await httpClient.patch(`/rendez-vous/${rdv.id_rdv}/confirmer`);
      toast.success('Rendez-vous confirmé !');
      onRefresh();
      onClose();
    } catch {
      toast.error('Erreur lors de la confirmation');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    setLoading('annule');
    try {
      await httpClient.patch(`/rendez-vous/${rdv.id_rdv}/annuler`, { raison: 'Annulé depuis le planning' });
      toast.success('Rendez-vous annulé');
      onRefresh();
      onClose();
    } catch {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setLoading(null);
      setShowCancelConfirm(false);
    }
  };

  // ← CORRECTION 2 : charger les infos patient depuis l'API si patient_nom manque
  const handleDownloadPDF = async () => {
    let rdvEnrichi = rdv;
    if (!rdv.patient_nom) {
      try {
        const resp = await httpClient.get(`/patients/${rdv.id_patient}`);
        const p = resp.data.data ?? resp.data;
        rdvEnrichi = {
          ...rdv,
          patient_nom:    p.nom_patient,
          patient_prenom: p.prenom_patient,
          patient_age:    rdv.patient_age ?? Math.floor(
            (Date.now() - new Date(p.date_naissance).getTime()) / (365.25 * 24 * 3600 * 1000)
          ),
        };
      } catch {
        // Si l'API échoue, générer quand même avec les données disponibles
      }
    }
    generateTicketPDF(rdvEnrichi, docteurNom);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className={`${bgColor} p-5 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                {TYPE_LABEL[rdv.type_rdv ?? ''] ?? rdv.type_rdv} • {rdv.heure_rdv}
              </p>
              <h2 className="text-xl font-bold">
                {rdv.patient_nom ?? 'Patient'} {rdv.patient_prenom ?? ''}
              </h2>
              {rdv.patient_age && <p className="text-white/80 text-sm mt-0.5">{rdv.patient_age} ans</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatutBadge statut={rdv.statut_rdv} />
              <button onClick={onClose} aria-label="Fermer" className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <p className="text-sm font-bold text-gray-800 capitalize">{dateFormatee.split(' ').slice(0,3).join(' ')}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Heure</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <p className="text-sm font-bold text-gray-800">{rdv.heure_rdv} • {rdv.duree_estimee ?? 30} min</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Médecin</p>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-500" />
              <p className="text-sm font-bold text-gray-800">Dr. {docteurNom}</p>
            </div>
          </div>

          {rdv.motif_rdv && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Motif</p>
              <p className="text-sm text-gray-700 italic">{rdv.motif_rdv}</p>
            </div>
          )}

          {showCancelConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-bold text-red-700">Confirmer l'annulation ?</p>
              </div>
              <p className="text-xs text-red-600 mb-3">Cette action ne peut pas être annulée.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
                  Non, garder
                </button>
                <button onClick={handleCancel} disabled={loading === 'annule'}
                  className="flex-1 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1">
                  {loading === 'annule' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Oui, annuler
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {canConfirm && (
              <button onClick={handleConfirm} disabled={!!loading}
                className="flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                {loading === 'confirme' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmer
              </button>
            )}
            {canEdit && (
              <button onClick={() => { onEdit(rdv); onClose(); }}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all">
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {rdv.id_patient && (
              <button onClick={() => onOpenDossier(rdv.id_patient)}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-all border border-blue-200">
                <User className="w-4 h-4" />
                Dossier
              </button>
            )}
            {/* ← CORRECTION 2 : handleDownloadPDF charge le patient si besoin */}
            <button onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-semibold transition-all border border-green-200">
              <Download className="w-4 h-4" />
              Ticket PDF
            </button>
          </div>

          {canCancel && !showCancelConfirm && (
            <button onClick={() => setShowCancelConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all border border-red-200">
              <XCircle className="w-4 h-4" />
              Annuler le rendez-vous
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PlanningPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rendezVous, loading: loadingRdv, fetchByDate } = useRendezVous();

  const [selectedDate, setSelectedDate]       = useState(new Date());
  const [showCalendar, setShowCalendar]       = useState(false);
  const [selectedDocteur, setSelectedDocteur] = useState<number | null>(null);
  const [docteurs, setDocteurs]               = useState<Docteur[]>([]);
  const [loadingDocteurs, setLoadingDocteurs] = useState(true);
  const [errorDocteurs, setErrorDocteurs]     = useState<string | null>(null);
  const [view, setView]                       = useState<'jour' | 'semaine' | 'mois'>('jour');
  const [searchQuery, setSearchQuery]         = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStatut, setFilterStatut]       = useState<FilterStatut>('tous');
  const [filterType, setFilterType]           = useState<FilterType>('tous');
  const [showModal, setShowModal]             = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<{ docteurId?: number; heure?: string }>({});
  const [selectedRdv, setSelectedRdv]         = useState<RendezVous | null>(null);
  const [editingRdv, setEditingRdv]           = useState<RendezVous | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

const loadDocteurs = useCallback(async () => {
  try {
    setLoadingDocteurs(true);
    setErrorDocteurs(null);
    const response = await httpClient.get('/utilisateurs', { params: { role: 'medecin', statut: 'actif' } });
    const raw: Array<{ id_utilisateur?: number; id_user?: number; nom: string; prenom: string; specialite?: string }> =
      response.data.data ?? response.data ?? [];
    let mapped = Array.isArray(raw) ? raw.map(u => ({
      id_user:    u.id_utilisateur ?? u.id_user ?? 0,
      nom:        u.nom,
      prenom:     u.prenom,
      specialite: u.specialite ?? 'Médecin',
    })) : [];

    // Médecin → ne voir que sa propre colonne
    if (user?.role === 'medecin') {
      mapped = mapped.filter(d => d.id_user === user.id_user);
    }

    setDocteurs(mapped);
  } catch {
    setErrorDocteurs('Impossible de charger les médecins.');
    setDocteurs([]);
  } finally {
    setLoadingDocteurs(false);
  }
}, [user]); 

  useEffect(() => { loadDocteurs(); }, [loadDocteurs]);

 // Après
useEffect(() => {
  const dateStr = selectedDate.toISOString().split('T')[0];
  // Médecin → forcer son propre id, admin → utiliser le filtre sélectionné
  const docteurId = user?.role === 'medecin'
    ? user.id_user
    : (selectedDocteur ?? undefined);
  fetchByDate(dateStr, docteurId);
}, [selectedDate, selectedDocteur, fetchByDate, user]);

  const goToPreviousDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goToNextDay     = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

  const docteursAffiches = selectedDocteur ? docteurs.filter(d => d.id_user === selectedDocteur) : docteurs;

  const rdvFiltres = rendezVous.filter(r => {
    const matchStatut = filterStatut === 'tous' || r.statut_rdv === filterStatut;
    const matchType   = filterType === 'tous'   || r.type_rdv === filterType;
    return matchStatut && matchType;
  });

  const getRdv      = (docteurId: number, heure: string) => rdvFiltres.find(r => r.id_docteur === docteurId && r.heure_rdv === heure);
  const getRdvCount = (docteurId: number) => rendezVous.filter(r => r.id_docteur === docteurId).length;

  const colWidth = docteursAffiches.length <= 3 ? '240px' : docteursAffiches.length <= 6 ? '180px' : '140px';
  const gridCols = `72px repeat(${docteursAffiches.length}, minmax(${colWidth}, 1fr))`;
  const hasActiveFilter = filterStatut !== 'tous' || filterType !== 'tous';

  const openModal = (docteurId?: number, heure?: string) => {
    setPreselectedSlot({ docteurId, heure });
    setShowModal(true);
  };

  const onModalSuccess = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetchByDate(dateStr, selectedDocteur ?? undefined);
  };

  const getDocteurNom = (rdv: RendezVous) => {
    if (rdv.docteur_nom) return `${rdv.docteur_prenom ?? ''} ${rdv.docteur_nom}`.trim();
    const doc = docteurs.find(d => d.id_user === rdv.id_docteur);
    return doc ? `${doc.prenom} ${doc.nom}` : 'Médecin';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="font-medium">Retour</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Calendar className="w-8 h-8 text-white" /></div>
              <div>
                <h1 className="text-2xl font-bold text-white">Planning Service Cardiologie</h1>
                <p className="text-cyan-100 text-sm mt-0.5">
                  CENHOSOA — Gestion des rendez-vous médicaux
                  {!loadingDocteurs && docteurs.length > 0 && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {docteurs.length} médecin{docteurs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadDocteurs} disabled={loadingDocteurs} title="Actualiser" aria-label="Actualiser la liste des médecins"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium text-sm transition-all border border-white/20 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loadingDocteurs ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser l'équipe</span>
            </button>
            <button onClick={() => openModal()} disabled={docteurs.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-cyan-600 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus className="w-5 h-5" />Nouveau RDV
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousDay} aria-label="Jour précédent" title="Jour précédent" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div ref={calendarRef} className="relative">
              <button onClick={() => setShowCalendar(o => !o)} aria-label="Choisir une date" title="Cliquer pour choisir une date"
                className="flex items-center gap-3 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg min-w-[280px] justify-center transition-colors">
                <Calendar className="w-4 h-4 text-white" />
                <span className="font-semibold text-white capitalize text-sm">{formatDate(selectedDate)}</span>
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
              </button>
              {showCalendar && <MiniCalendar value={selectedDate} onChange={d => setSelectedDate(d)} onClose={() => setShowCalendar(false)} />}
            </div>
            <button onClick={goToNextDay} aria-label="Jour suivant" title="Jour suivant" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 bg-white/90 hover:bg-white text-cyan-600 rounded-lg font-medium text-sm">Aujourd'hui</button>
            {(['jour', 'semaine', 'mois'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === v ? 'bg-white text-cyan-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher patient, ID..." aria-label="Rechercher un patient"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none text-sm" />
            </div>
          </div>

          <div className="border-b border-gray-200">
            <button onClick={() => setShowFilterPanel(o => !o)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Filtres</h3>
                <Filter className="w-4 h-4 text-gray-400" />
                {hasActiveFilter && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </button>
            {showFilterPanel && (
              <div className="px-4 pb-4 space-y-3 bg-gray-50/50">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Statut</p>
                  <FilterDropdown label="Tous les statuts" options={STATUT_OPTIONS} value={filterStatut} onChange={(v) => setFilterStatut(v as FilterStatut)} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Type</p>
                  <FilterDropdown label="Tous les types" options={TYPE_OPTIONS} value={filterType} onChange={(v) => setFilterType(v as FilterType)} />
                </div>
                {hasActiveFilter && (
                  <button onClick={() => { setFilterStatut('tous'); setFilterType('tous'); }} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-gray-700">Équipe Médicale</h3>
              </div>
              {loadingDocteurs && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
            </div>

            {loadingDocteurs && <div className="flex flex-col items-center justify-center py-10 gap-2"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /><p className="text-xs text-gray-400">Chargement...</p></div>}
            {!loadingDocteurs && errorDocteurs && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <UserX className="w-10 h-10 text-gray-300" />
                <p className="text-xs text-gray-500">{errorDocteurs}</p>
                <button onClick={loadDocteurs} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-semibold hover:bg-cyan-100"><RefreshCw className="w-3.5 h-3.5" />Réessayer</button>
              </div>
            )}
            {!loadingDocteurs && !errorDocteurs && docteurs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <UserX className="w-10 h-10 text-gray-300" />
                <p className="text-xs text-gray-500 leading-relaxed">Aucun médecin actif.<br />Ajoutez des utilisateurs avec le rôle <strong>médecin</strong>.</p>
              </div>
            )}
           {!loadingDocteurs && !errorDocteurs && docteurs.length > 0 && (
  <>
    {/* Bouton "Tous les médecins" — masqué pour le médecin connecté */}
    {user?.role !== 'medecin' && (
      <button onClick={() => setSelectedDocteur(null)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all border ${selectedDocteur === null ? 'bg-cyan-50 border-cyan-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">ALL</div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-gray-800 text-sm">Tous les médecins</p>
          <p className="text-xs text-gray-500">Vue d'ensemble</p>
        </div>
        <span className="text-sm font-bold text-gray-500 shrink-0">{docteurs.length}</span>
      </button>
    )}
    {docteurs.map(doc => {
      const count = getRdvCount(doc.id_user);
      return (
        <button key={doc.id_user} onClick={() => setSelectedDocteur(doc.id_user)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all border ${selectedDocteur === doc.id_user ? 'bg-cyan-50 border-cyan-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {`${doc.prenom.charAt(0)}${doc.nom.charAt(0)}`.toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${count > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">Dr. {doc.prenom} {doc.nom}</p>
            <p className="text-xs text-gray-500 truncate">{doc.specialite}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${count > 0 ? 'text-cyan-600' : 'text-gray-400'}`}>{count}</p>
            <p className="text-[10px] text-gray-400">RDV</p>
          </div>
          <Eye className="w-4 h-4 text-gray-300 shrink-0" />
        </button>
      );
    })}
  </>
)}
          </div>
        </div>

        {/* Grille */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex flex-wrap gap-4 text-xs">
              {Object.entries({ Consultation: 'bg-cyan-500', Contrôle: 'bg-green-500', Urgence: 'bg-red-500', Suivi: 'bg-orange-500' }).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 ${color} rounded-sm`} /><span className="text-gray-600">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-dashed border-gray-300 rounded-sm" /><span className="text-gray-600">Disponible</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasActiveFilter && <span className="text-xs text-cyan-600 font-semibold bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">Filtres actifs</span>}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Cliquer sur un RDV pour voir les options
              </span>
            </div>
          </div>

          {!loadingDocteurs && docteursAffiches.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10">
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center"><Users className="w-8 h-8 text-cyan-300" /></div>
              <div>
                <p className="text-lg font-bold text-gray-700 mb-1">Aucun médecin à afficher</p>
                <p className="text-sm text-gray-500 max-w-sm leading-relaxed">Le planning se génère automatiquement dès qu'un utilisateur avec le rôle <strong>médecin</strong> est ajouté et actif.</p>
              </div>
              <button onClick={loadDocteurs} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Actualiser</button>
            </div>
          )}

          {docteursAffiches.length > 0 && (
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="min-w-full">
                <div className="grid sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm" style={{ gridTemplateColumns: gridCols }}>
                  <div className="p-3 border-r border-gray-100 flex items-center justify-center bg-gray-50">
                    <span className="text-xs font-medium text-gray-400">Heure</span>
                  </div>
                  {docteursAffiches.map(doc => (
                    <div key={doc.id_user} className="p-3 border-r border-gray-100 last:border-r-0">
                      <div className="text-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-1.5">
                          {`${doc.prenom.charAt(0)}${doc.nom.charAt(0)}`.toUpperCase()}
                        </div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">Dr. {doc.prenom} {doc.nom}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{doc.specialite}</p>
                        <p className={`text-[11px] font-semibold mt-1 ${getRdvCount(doc.id_user) > 0 ? 'text-cyan-600' : 'text-gray-400'}`}>
                          {getRdvCount(doc.id_user)} RDV aujourd'hui
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map(heure => (
                  <div key={heure} className="grid border-b border-gray-100 hover:bg-white/60 transition-colors" style={{ gridTemplateColumns: gridCols }}>
                    <div className="p-2 border-r border-gray-100 flex items-center justify-center bg-gray-50/80">
                      <span className="text-xs font-bold text-gray-500">{heure}</span>
                    </div>
                    {docteursAffiches.map(doc => {
                      const rdv = getRdv(doc.id_user, heure);
                      return (
                        <div key={`${doc.id_user}-${heure}`} className="p-1.5 border-r border-gray-100 last:border-r-0 min-h-[72px]">
                          {rdv ? (
                            // ← CORRECTION 1 : enrichir le RDV avec le nom du médecin au clic
                            <div
                              onClick={() => {
                                const docTrouve = docteurs.find(d => d.id_user === rdv.id_docteur);
                                setSelectedRdv({
                                  ...rdv,
                                  docteur_nom:    rdv.docteur_nom    ?? docTrouve?.nom,
                                  docteur_prenom: rdv.docteur_prenom ?? docTrouve?.prenom,
                                });
                              }}
                              className={`${TYPE_COLORS[rdv.type_rdv ?? ''] ?? 'bg-cyan-500'} p-2.5 rounded-xl h-full cursor-pointer hover:shadow-lg hover:brightness-105 hover:scale-[1.01] transition-all relative group`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="text-white/70 font-bold text-[10px]">{heure}</span>
                                <StatutBadge statut={rdv.statut_rdv} />
                              </div>
                              <p className="text-white font-bold text-sm leading-tight truncate">{rdv.patient_nom} {rdv.patient_prenom}</p>
                              {rdv.patient_age && <p className="text-white/80 text-xs mt-0.5">{rdv.patient_age} ans • {rdv.type_rdv}</p>}
                              {rdv.motif_rdv && <p className="text-white/60 text-[10px] mt-1 truncate italic">{rdv.motif_rdv}</p>}
                              <div className="absolute inset-0 bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg">Voir options</span>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => openModal(doc.id_user, heure)} aria-label={`Nouveau RDV pour Dr. ${doc.nom} à ${heure}`}
                              className="w-full h-full min-h-[56px] border border-dashed border-gray-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50/60 transition-all flex items-center justify-center group">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                <Plus className="w-4 h-4 text-cyan-500 mx-auto mb-0.5" />
                                <p className="text-[10px] text-cyan-600 font-semibold">Planifier</p>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loadingRdv && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-5 shadow-2xl flex items-center gap-4">
            <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
            <p className="text-gray-700 font-semibold text-sm">Chargement des rendez-vous...</p>
          </div>
        </div>
      )}

      {showModal && (
        <NouveauRdvModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setPreselectedSlot({}); setEditingRdv(null); }}
          onSuccess={onModalSuccess}
          datePreselection={editingRdv ? String(editingRdv.date_rdv).split('T')[0] : selectedDate.toISOString().split('T')[0]}
          heurePreselection={editingRdv ? editingRdv.heure_rdv : preselectedSlot.heure}
          docteurPreselection={editingRdv ? editingRdv.id_docteur : preselectedSlot.docteurId}
          patientPreselection={editingRdv ? editingRdv.id_patient : undefined}
        />
      )}

      {selectedRdv && (
        <RdvDetailModal
          rdv={selectedRdv}
          docteurNom={getDocteurNom(selectedRdv)}
          onClose={() => setSelectedRdv(null)}
          onRefresh={onModalSuccess}
          onEdit={(rdv) => { setEditingRdv(rdv); setShowModal(true); }}
          onOpenDossier={(patientId) => navigate(`/patients/${patientId}/dossier`)}
        />
      )}
    </div>
  );
}