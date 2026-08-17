import { useState } from 'react';
import { useSoinsMedicaux } from '../../../hooks/useSoinsMedicaux';
import { useAuth } from '../../../hooks/useAuth';
import type { Patient } from '../../../../core/entities/Patient';
import type { SoinMedical, CreateSoinMedicalDTO } from '../../../../core/entities/SoinMedical';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus, Heart, Calendar, Clock, CheckCircle, FileText,
  Download, FileArchive, ChevronDown, ChevronUp, Pencil,
  Clock3, XCircle, ShieldCheck, Printer,
} from 'lucide-react';
import { soinMedicalToHTML } from '../../../../shared/utils/printSoinMedical';
import { printHTML, patientHeaderHTML, footerHTML } from '../../../../shared/utils/printUtils';
import AddSoinMedicalModal    from './AddSoinMedicalModal';
import EditSoinMedicalModal   from './EditSoinMedicalModal';
import { PermissionGuard }    from '../../common/PermissionGuard';
import { SignatureBadge }     from '../../common/SignatureBadge';
import { toast }              from 'sonner';
import { httpClient }         from '../../../../infrastructure/http/axios.config';

import AjouterPieceJointeButton from '../../common/AjouterPieceJointeButton';

import QuickSoinMedicalAttachmentButton from './QuickSoinMedicalAttachmentButton';

interface SoinsMedicauxTabProps {
  patient: Patient;
}

function StatutBadge({ statut, valideurNom, valideurPrenom, modeGarde }: {
  statut:          'en_attente' | 'valide' | 'rejete';
  valideurNom?:    string;
  valideurPrenom?: string;
  modeGarde?:      boolean;
}) {
  if (statut === 'valide') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        {modeGarde ? 'Validé (garde)' : valideurNom
          ? `Validé — Dr. ${valideurPrenom} ${valideurNom}`
          : 'Validé'}
      </span>
    );
  }
  if (statut === 'rejete') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />Rejeté
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
      <Clock3 className="w-3 h-3" />En attente de validation
    </span>
  );
}

function borderColor(statut: string) {
  if (statut === 'valide')  return 'border-l-green-500';
  if (statut === 'rejete')  return 'border-l-red-400';
  return 'border-l-amber-400';
}

export default function SoinsMedicauxTab({ patient }: SoinsMedicauxTabProps) {
  const { soins, loading, error, createSoin, updateSoin, refreshSoins } = useSoinsMedicaux(patient.id_patient);
  const { user } = useAuth();
  const isMedecin = user?.role === 'medecin';

  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingSoin,    setEditingSoin]    = useState<SoinMedical | null>(null);
  const [downloading,    setDownloading]    = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [expandedId,     setExpandedId]     = useState<number | null>(null);
  const [validating,     setValidating]     = useState<number | null>(null);

  const handleCreateSoin = async (data: CreateSoinMedicalDTO) => {
    await createSoin(data);
    setShowAddModal(false);
  };

  const handleUpdateSoin = async (id: number, data: Partial<CreateSoinMedicalDTO>) => {
    const ok = await updateSoin(id, data);
    if (ok) {
      toast.success('Soin modifié avec succès !');
      setEditingSoin(null);
    } else {
      throw new Error('Erreur lors de la modification');
    }
  };

  // ── Validation par le médecin ─────────────────────────────────────────────
  const handleValider = async (soin: SoinMedical, statut: 'valide' | 'rejete') => {
    setValidating(soin.id_soin_medical);
    try {
      await httpClient.patch(`/soins-medicaux/${soin.id_soin_medical}/valider`, { statut });
      toast.success(statut === 'valide' ? 'Soin validé ✓' : 'Soin rejeté');
      await refreshSoins();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation';
      toast.error(message);
    } finally {
      setValidating(null);
    }
  };

  const handleDownloadPDF = async (soinId: number) => {
    setDownloading(soinId);
    try {
      const response = await httpClient.get(`/soins-medicaux/${soinId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `soin_medical_${soinId}_${patient.nom_patient}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès !');
    } catch {
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(null);
    }
  };

  const handlePrintSoin = (soin: SoinMedical) => {
  const html = patientHeaderHTML(patient) + soinMedicalToHTML(soin) + footerHTML();
  printHTML(html, `Soin médical — ${patient.nom_patient} ${patient.prenom_patient}`);
};

  const handleDownloadAllZIP = async () => {
    if (soins.length === 0) { toast.error('Aucun soin à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/soins-medicaux/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `soins_medicaux_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${soins.length} soin(s) téléchargé(s) !`);
    } catch {
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading && soins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des soins médicaux...</p>
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

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Soins médicaux</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {soins.length === 0
              ? 'Aucun soin enregistré'
              : `${soins.length} soin${soins.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {soins.length > 0 && (
            <button onClick={handleDownloadAllZIP} disabled={downloadingAll}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {downloadingAll
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>}
            </button>
          )}

          <QuickSoinMedicalAttachmentButton patientId={patient.id_patient} createSoin={createSoin} />
          <PermissionGuard permission="soins-medicaux.write">
            <button onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouveau soin</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSoinMedicalModal patient={patient} onClose={() => setShowAddModal(false)} onSubmit={handleCreateSoin} />
      )}
      {editingSoin && (
        <EditSoinMedicalModal
          patient={patient}
          soin={editingSoin}
          onClose={() => setEditingSoin(null)}
          onSubmit={handleUpdateSoin}
        />
      )}

      {/* État vide */}
      {soins.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun soin médical enregistré</h4>
          <p className="text-xs text-gray-500 mb-5">Les soins médicaux réalisés apparaîtront ici.</p>
          <PermissionGuard permission="soins-medicaux.write">
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />Créer le premier soin
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {soins.map((soin) => {
            const isExpanded   = expandedId === soin.id_soin_medical;
            const hasDetails   = soin.ett || soin.eto || soin.autre;
            const isValidating = validating === soin.id_soin_medical;
            const statut       = soin.statut ?? (soin.verifie ? 'valide' : 'en_attente');

            return (
              <div key={soin.id_soin_medical}
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all border-l-4 ${borderColor(statut)}`}>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1.5">
                          <Heart className="w-3 h-3" />Soin médical
                        </span>
                        <StatutBadge
                          statut={statut}
                          valideurNom={soin.valideur_nom}
                          valideurPrenom={soin.valideur_prenom}
                          modeGarde={soin.mode_garde}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(soin.date_soin), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />{soin.heure_soin}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">

                      {/* Boutons valider/rejeter — médecin uniquement, actes en attente */}
                      {isMedecin && statut === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleValider(soin, 'valide')}
                            disabled={isValidating}
                            className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50">
                            {isValidating
                              ? <span className="inline-block w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              : <ShieldCheck className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Valider</span>
                          </button>
                          <button
                            onClick={() => handleValider(soin, 'rejete')}
                            disabled={isValidating}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Rejeter</span>
                          </button>
                        </>
                      )}

                      <PermissionGuard permission="soins-medicaux.write">
                        <button onClick={() => setEditingSoin(soin)}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs">
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Modifier</span>
                        </button>
                      </PermissionGuard>

                      <button
  onClick={() => handlePrintSoin(soin)}
  title="Imprimer"
  className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs">
  <Printer className="w-3.5 h-3.5" />
  <span className="hidden sm:inline">Imprimer</span>
</button>

                      <button onClick={() => handleDownloadPDF(soin.id_soin_medical)}
                        disabled={downloading === soin.id_soin_medical}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50">
                        {downloading === soin.id_soin_medical
                          ? <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          : <Download className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {hasDetails && (
                        <button onClick={() => setExpandedId(isExpanded ? null : soin.id_soin_medical)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-xs font-medium flex items-center gap-1.5">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isExpanded ? 'Moins' : 'Détails'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {hasDetails && !isExpanded && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {soin.ett   && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">ETT</span>}
                      {soin.eto   && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">ETO</span>}
                      {soin.autre && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">Autre</span>}
                    </div>
                  )}

                  <SignatureBadge
                    nom={soin.realise_par}
                    date={String(soin.date_soin)}
                    heure={soin.heure_soin}
                    verifie={soin.verifie}
                    role="medecin"
                  />

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <AjouterPieceJointeButton 
                    entiteType="soin_medical"
                    entiteId={soin.id_soin_medical}
                    patientId={patient.id_patient}
                    />
                    </div>
                </div>

                {isExpanded && hasDetails && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4 space-y-3">
                    {soin.ett && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Heart className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">ETT — Échocardiographie Transthoracique</p>
                            <p className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed">{soin.ett}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {soin.eto && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Heart className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">ETO — Échocardiographie Transœsophagienne</p>
                            <p className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed">{soin.eto}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {soin.autre && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Autre soin médical</p>
                            <p className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed">{soin.autre}</p>
                          </div>
                        </div>
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