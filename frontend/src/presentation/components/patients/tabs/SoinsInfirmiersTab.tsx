import { useState } from 'react';
import { useSoinsInfirmiers } from '../../../hooks/useSoinsInfirmiers';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateSoinInfirmierDTO } from '../../../../core/entities/SoinInfirmier';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Syringe, Calendar, Clock, User, CheckCircle, Activity, Download, FileArchive, ChevronDown, ChevronUp } from 'lucide-react';
import AddSoinInfirmierModal from './AddSoinInfirmierModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface SoinsInfirmiersTabProps {
  patient: Patient;
}

// Labels courts pour les pills de résumé
const SOIN_LABELS: { key: keyof ReturnType<typeof getSoinFields>; label: string }[] = [
  { key: 'ecg',          label: 'ECG'          },
  { key: 'ecg_dii_long', label: 'ECG DII Long' },
  { key: 'injection_iv', label: 'IV'            },
  { key: 'injection_im', label: 'IM'            },
  { key: 'pse',          label: 'PSE'           },
  { key: 'pansement',    label: 'Pansement'     },
  { key: 'autre_soins',  label: 'Autre'         },
];

// Helper pour extraire les champs de soin remplis
function getSoinFields(soin: Record<string, unknown>) {
  return {
    ecg:          soin.ecg          as string | undefined,
    ecg_dii_long: soin.ecg_dii_long as string | undefined,
    injection_iv: soin.injection_iv as string | undefined,
    injection_im: soin.injection_im as string | undefined,
    pse:          soin.pse          as string | undefined,
    pansement:    soin.pansement    as string | undefined,
    autre_soins:  soin.autre_soins  as string | undefined,
  };
}

export default function SoinsInfirmiersTab({ patient }: SoinsInfirmiersTabProps) {
  const { soins, loading, error, createSoin, verifySoin } = useSoinsInfirmiers(patient.id_patient);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [downloading,    setDownloading]    = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  // IHM — accordion par soin
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleCreateSoin = async (data: CreateSoinInfirmierDTO) => {
    await createSoin(data);
    setShowAddModal(false);
  };

  const handleVerify = async (id: number) => {
    await verifySoin(id);
  };

  const handleDownloadPDF = async (soinId: number) => {
    setDownloading(soinId);
    try {
      const response = await httpClient.get(`/soins-infirmiers/${soinId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `soin_infirmier_${soinId}_${patient.nom_patient}.pdf`);
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
    if (soins.length === 0) { toast.error('Aucun soin à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/soins-infirmiers/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `soins_infirmiers_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${soins.length} soin(s) téléchargé(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // ── Chargement / erreur ───────────────────────────────────────────────────────

  if (loading && soins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des soins infirmiers...</p>
      </div>
    );
  }

  if (error && soins.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">❌ {error}</p>
        <p className="text-red-600 text-sm mt-1">Veuillez réessayer ou contacter l'administrateur.</p>
      </div>
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Soins infirmiers</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {soins.length === 0
              ? 'Aucun soin enregistré'
              : `${soins.length} soin${soins.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* ZIP — visible pour tous */}
          {soins.length > 0 && (
            <button
              onClick={handleDownloadAllZIP}
              disabled={downloadingAll}
              title="Télécharger tous les soins en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {downloadingAll
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>
              }
            </button>
          )}

          {/* ✅ Nouveau soin — uniquement si permission write */}
          <PermissionGuard permission="soins-infirmiers.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouveau soin</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Modal ── */}
      {showAddModal && (
        <AddSoinInfirmierModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateSoin}
        />
      )}

      {/* ── État vide ── */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Syringe className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun soin infirmier enregistré</h4>
          <p className="text-xs text-gray-500 mb-5">Les soins réalisés par l'équipe infirmière apparaîtront ici.</p>
          {/* ✅ Créer le premier — uniquement si permission write */}
          <PermissionGuard permission="soins-infirmiers.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer le premier soin
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {soins.map((soin) => {
            const isExpanded = expandedId === soin.id_soin_infirmier;
            const fields     = getSoinFields(soin as unknown as Record<string, unknown>);
            const hasDetails = Object.values(fields).some(Boolean);
            const filledKeys = SOIN_LABELS.filter(({ key }) => !!fields[key]);

            return (
              <div
                key={soin.id_soin_infirmier}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all border-l-4 ${
                  soin.verifie ? 'border-l-green-500' : 'border-l-cyan-500'
                }`}
              >
                {/* ── En-tête ── */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1.5">
                          <Syringe className="w-3 h-3" />
                          Soin infirmier
                        </span>
                        {/* ✅ Badge vérifié — vert si vérifié */}
                        {soin.verifie && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Vérifié
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(soin.date_soin), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {soin.heure_soin}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {soin.realise_par}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* PDF — visible pour tous */}
                      <button
                        onClick={() => handleDownloadPDF(soin.id_soin_infirmier)}
                        disabled={downloading === soin.id_soin_infirmier}
                        title="Télécharger en PDF"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50"
                      >
                        {downloading === soin.id_soin_infirmier
                          ? <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          : <Download className="w-3.5 h-3.5" />
                        }
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {/* ✅ Marquer vérifié — uniquement si permission write */}
                      <PermissionGuard permission="soins-infirmiers.write">
                        <button
                          onClick={() => handleVerify(soin.id_soin_infirmier)}
                          disabled={loading || soin.verifie}
                          title={soin.verifie ? 'Déjà vérifié' : 'Marquer comme vérifié'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 whitespace-nowrap border ${
                            soin.verifie
                              ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {soin.verifie
                            ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Vérifié</span>
                            : 'Marquer vérifié'
                          }
                        </button>
                      </PermissionGuard>

                      {/* Accordion toggle */}
                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : soin.id_soin_infirmier)}
                          title={isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-xs font-medium flex items-center gap-1.5"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isExpanded ? 'Moins' : 'Détails'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pills résumé des soins réalisés (visibles quand accordion fermé) */}
                  {hasDetails && !isExpanded && filledKeys.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {filledKeys.map(({ key, label }) => (
                        <span key={key} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Détails (accordion) ── */}
                {isExpanded && hasDetails && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4 space-y-3">

                    {/* Composant générique pour chaque soin */}
                    {[
                      { value: soin.ecg,          label: 'ECG',                          icon: <Activity className="w-4 h-4 text-gray-500" /> },
                      { value: soin.ecg_dii_long, label: 'ECG DII Long',                 icon: <Activity className="w-4 h-4 text-gray-500" /> },
                      { value: soin.injection_iv, label: 'Injection intraveineuse (IV)',  icon: <Syringe  className="w-4 h-4 text-gray-500" /> },
                      { value: soin.injection_im, label: 'Injection intramusculaire (IM)',icon: <Syringe  className="w-4 h-4 text-gray-500" /> },
                      { value: soin.pse,          label: 'PSE — Pousse-Seringue',        icon: <Activity className="w-4 h-4 text-gray-500" /> },
                      { value: soin.pansement,    label: 'Pansement',                    icon: <span className="text-sm">🩹</span>            },
                      { value: soin.autre_soins,  label: 'Autres soins',                 icon: <Syringe  className="w-4 h-4 text-gray-500" /> },
                    ]
                      .filter(({ value }) => !!value)
                      .map(({ value, label, icon }) => (
                        <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                              <p className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed">{value}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
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