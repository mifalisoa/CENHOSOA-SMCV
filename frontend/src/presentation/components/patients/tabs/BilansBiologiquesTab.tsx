import { useState } from 'react';
import { useBilansBiologiques } from '../../../hooks/useBilansBiologiques';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateBilanBiologiqueDTO } from '../../../../core/entities/BilanBiologique';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Beaker, Calendar, Clock, User, Building2, Download, FileArchive, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AddBilanBiologiqueModal from './AddBilanBiologiqueModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface BilansBiologiquesTabProps {
  patient: Patient;
}

// ── Plages normales ───────────────────────────────────────────────────────────
// Source : valeurs de référence adulte standard

interface NormRange {
  min: number;
  max: number;
  unit: string;
  label: string;
}

const NORMES: Record<string, NormRange> = {
  creatinine: { min: 7,   max: 13,  unit: 'mg/L',  label: 'Créatinine'  },
  glycemie:   { min: 0.7, max: 1.1, unit: 'g/L',   label: 'Glycémie'    },
  crp:        { min: 0,   max: 5,   unit: 'mg/L',   label: 'CRP'         },
  inr:        { min: 0.8, max: 1.2, unit: '',        label: 'INR'         },
  nfs:        { min: 4,   max: 10,  unit: '×10³/µL', label: 'NFS'        },
};

type Status = 'normal' | 'high' | 'low';

function getStatus(value: string | number | undefined, key: string): Status | null {
  if (!value) return null;
  const norme = NORMES[key];
  if (!norme) return null;
  const num = parseFloat(String(value));
  if (isNaN(num)) return null;
  if (num < norme.min) return 'low';
  if (num > norme.max) return 'high';
  return 'normal';
}

// ── Composant ResultCard — max 3 couleurs ─────────────────────────────────────

interface ResultCardProps {
  valKey: string;
  value:  string | number;
}

function ResultCard({ valKey, value }: ResultCardProps) {
  const norme  = NORMES[valKey];
  const status = getStatus(value, valKey);

  // ✅ 3 couleurs seulement :
  // gris   → neutre (pas de norme connue)
  // vert   → valeur normale
  // rouge  → valeur hors norme (haut ou bas)

  const styles = {
    normal: {
      card:   'bg-green-50 border-green-200',
      label:  'text-green-700',
      value:  'text-green-900',
      norme:  'text-green-600',
      icon:   <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
      badge:  null,
    },
    high: {
      card:   'bg-red-50 border-red-200',
      label:  'text-red-700',
      value:  'text-red-900',
      norme:  'text-red-500',
      icon:   <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
      badge:  <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">ÉLEVÉ</span>,
    },
    low: {
      card:   'bg-red-50 border-red-200',
      label:  'text-red-700',
      value:  'text-red-900',
      norme:  'text-red-500',
      icon:   <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
      badge:  <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">BAS</span>,
    },
    unknown: {
      card:   'bg-gray-50 border-gray-200',
      label:  'text-gray-500',
      value:  'text-gray-800',
      norme:  'text-gray-400',
      icon:   null,
      badge:  null,
    },
  };

  const s = styles[status ?? 'unknown'];

  return (
    <div className={`rounded-xl p-3 border ${s.card} flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between gap-1">
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${s.label}`}>
          {norme?.label ?? valKey}
        </p>
        {s.icon}
      </div>
      <p className={`text-lg sm:text-xl font-bold ${s.value}`}>
        {value}
        {norme?.unit && (
          <span className={`text-[10px] sm:text-xs font-normal ml-1 ${s.label}`}>{norme.unit}</span>
        )}
      </p>
      <div className="flex items-center justify-between gap-1">
        {norme && (
          <p className={`text-[9px] sm:text-[10px] ${s.norme}`}>
            Norme : {norme.min}–{norme.max}
          </p>
        )}
        {s.badge}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function BilansBiologiquesTab({ patient }: BilansBiologiquesTabProps) {
  const { bilans, loading, error, createBilan } = useBilansBiologiques(patient.id_patient);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [downloading,    setDownloading]    = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [expandedId,     setExpandedId]     = useState<number | null>(null);

  const handleCreateBilan = async (data: CreateBilanBiologiqueDTO) => {
    await createBilan(data);
    setShowAddModal(false);
  };

  const handleDownloadPDF = async (bilanId: number) => {
    setDownloading(bilanId);
    try {
      const response = await httpClient.get(`/bilans-biologiques/${bilanId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bilan_${bilanId}_${patient.nom_patient}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès !');
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAllZIP = async () => {
    if (bilans.length === 0) { toast.error('Aucun bilan à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/bilans-biologiques/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bilans_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${bilans.length} bilan(s) téléchargé(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Compte les valeurs hors norme d'un bilan
  const countAbnormal = (bilan: typeof bilans[0]): number => {
    const keys: Array<keyof typeof bilan> = ['creatinine', 'glycemie', 'crp', 'inr', 'nfs'];
    return keys.filter(k => {
      const s = getStatus(bilan[k] as string | undefined, k as string);
      return s === 'high' || s === 'low';
    }).length;
  };

  // ── Chargement ───────────────────────────────────────────────────────────────

  if (loading && bilans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des bilans...</p>
      </div>
    );
  }

  if (error && bilans.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">❌ {error}</p>
        <p className="text-red-600 text-sm mt-1">Veuillez réessayer ou contacter l'administrateur.</p>
      </div>
    );
  }

  // ── Rendu ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Bilans biologiques</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {bilans.length === 0
              ? 'Aucun bilan enregistré'
              : `${bilans.length} bilan${bilans.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {bilans.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              title="Télécharger tous les bilans en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingAll
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>
              }
            </button>
          )}

          <PermissionGuard permission="bilans.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouveau bilan</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddBilanBiologiqueModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateBilan}
        />
      )}

      {/* État vide */}
      {bilans.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Beaker className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun bilan biologique</h4>
          <p className="text-xs text-gray-500 mb-5">Les résultats d'analyses apparaîtront ici.</p>
          <PermissionGuard permission="bilans.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer le premier bilan
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {bilans.map((bilan) => {
            const isExpanded  = expandedId === bilan.id_bilan;
            const hasDetails  = bilan.resultat || bilan.interpretation || bilan.laboratoire;
            const nbAbnormal  = countAbnormal(bilan);

            return (
              <div
                key={bilan.id_bilan}
                className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md border-l-4 ${
                  nbAbnormal > 0 ? 'border-l-red-500 border-red-200' : 'border-l-cyan-500 border-gray-200'
                }`}
              >
                {/* En-tête */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1.5">
                          <Beaker className="w-3 h-3" />
                          {bilan.type_bilan || 'Bilan biologique'}
                        </span>
                        {/* ✅ Badge alerte — rouge si valeurs hors norme */}
                        {nbAbnormal > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {nbAbnormal} valeur{nbAbnormal > 1 ? 's' : ''} hors norme
                          </span>
                        )}
                        {nbAbnormal === 0 && (bilan.creatinine || bilan.glycemie || bilan.crp || bilan.inr || bilan.nfs) && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Tous normaux
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(bilan.date_prelevement), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {bilan.heure_prelevement}
                        </span>
                        {bilan.prescripteur && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            Dr. {bilan.prescripteur}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownloadPDF(bilan.id_bilan)}
                        disabled={downloading === bilan.id_bilan}
                        title="Télécharger en PDF"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50"
                      >
                        {downloading === bilan.id_bilan
                          ? <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          : <Download className="w-3.5 h-3.5" />
                        }
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : bilan.id_bilan)}
                          title={isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-xs font-medium flex items-center gap-1.5"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isExpanded ? 'Moins' : 'Détails'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ Résultats — colorés selon la norme (vert / rouge / gris) */}
                  {(bilan.creatinine || bilan.glycemie || bilan.crp || bilan.inr || bilan.nfs) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4">
                      {bilan.creatinine && <ResultCard valKey="creatinine" value={bilan.creatinine} />}
                      {bilan.glycemie   && <ResultCard valKey="glycemie"   value={bilan.glycemie}   />}
                      {bilan.crp        && <ResultCard valKey="crp"        value={bilan.crp}        />}
                      {bilan.inr        && <ResultCard valKey="inr"        value={bilan.inr}        />}
                      {bilan.nfs        && <ResultCard valKey="nfs"        value={bilan.nfs}        />}
                    </div>
                  )}
                </div>

                {/* Détails (accordion) */}
                {isExpanded && hasDetails && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4 space-y-3">
                    {bilan.resultat && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Résultats détaillés</p>
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{bilan.resultat}</p>
                      </div>
                    )}
                    {bilan.interpretation && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Interprétation</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{bilan.interpretation}</p>
                      </div>
                    )}
                    {bilan.laboratoire && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-medium">Laboratoire :</span>
                        <span>{bilan.laboratoire}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}