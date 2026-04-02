import { useState, useMemo } from 'react';
import { useTraitements } from '../../../hooks/useTraitements';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateOrdonnanceDTO } from '../../../../core/entities/Traitement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Pill, Calendar, Clock, User, FileText, Download, FileArchive, ChevronDown, ChevronUp } from 'lucide-react';
import AddTraitementModal from './AddTraitementModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { toast } from 'sonner';
import { httpClient } from "../../../../infrastructure/http/axios.config";

interface TraitementsTabProps {
  patient: Patient;
}

export default function TraitementsTab({ patient }: TraitementsTabProps) {
  const { traitements, loading, error, createOrdonnance } = useTraitements(patient.id_patient);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [downloading,    setDownloading]    = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  // Accordion — par id_ordonnance (groupe) ou par id_traitement (individuel)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // ── Groupage par id_ordonnance ────────────────────────────────────────────────
  // Les traitements sans id_ordonnance (anciens) sont traités individuellement
  const groupes = useMemo(() => {
    const map = new Map<string, typeof traitements>();

    traitements.forEach(t => {
      // Clé = id_ordonnance si groupé, sinon id_traitement unique
      const key = t.id_ordonnance ?? `solo_${t.id_traitement}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });

    // Convertit en tableau trié par date décroissante (premier médicament du groupe)
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      isGroupe: !!items[0].id_ordonnance,
      items,
      // Infos communes prises sur le premier médicament
      date:         items[0].date_prescription,
      heure:        items[0].heure_prescription,
      type:         items[0].type_document,
      prescripteur: items[0].prescripteur,
      diagnostic:   items[0].diagnostic,
      lieu:         items[0].lieu_prescription,
    }));
  }, [traitements]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreateOrdonnance = async (data: CreateOrdonnanceDTO) => {
    await createOrdonnance(data);
    setShowAddModal(false);
  };

  const handleDownloadPDF = async (traitementId: number) => {
    setDownloading(traitementId);
    try {
      const response = await httpClient.get(`/traitements/${traitementId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traitement_${traitementId}_${patient.nom_patient}.pdf`);
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
    if (traitements.length === 0) { toast.error('Aucun traitement à télécharger'); return; }
    setDownloadingAll(true);
    try {
      const response = await httpClient.get(`/traitements/patient/${patient.id_patient}/zip`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traitements_${patient.nom_patient}_${patient.prenom_patient}.zip`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${traitements.length} traitement(s) téléchargé(s) !`);
    } catch (err) {
      console.error('Erreur téléchargement ZIP:', err);
      toast.error('Erreur lors du téléchargement du ZIP');
    } finally {
      setDownloadingAll(false);
    }
  };

  // ── Chargement / erreur ───────────────────────────────────────────────────────

  if (loading && traitements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des traitements...</p>
      </div>
    );
  }

  if (error && traitements.length === 0) {
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Traitements</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {traitements.length === 0
              ? 'Aucun traitement enregistré'
              : `${traitements.length} médicament${traitements.length > 1 ? 's' : ''} · ${groupes.length} prescription${groupes.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {traitements.length > 0 && (
            <button onClick={handleDownloadAllZIP} disabled={downloadingAll}
              title="Télécharger tous les traitements en ZIP"
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {downloadingAll
                ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span className="hidden sm:inline">Téléchargement...</span></>
                : <><FileArchive className="w-4 h-4" /><span className="hidden sm:inline">Tout (ZIP)</span><span className="sm:hidden">ZIP</span></>
              }
            </button>
          )}

          <PermissionGuard permission="prescriptions.write">
            <button onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md font-medium flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle prescription</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddTraitementModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateOrdonnance}
        />
      )}

      {/* État vide */}
      {traitements.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun traitement enregistré</h4>
          <p className="text-xs text-gray-500 mb-5">Les ordonnances et prescriptions apparaîtront ici.</p>
          <PermissionGuard permission="prescriptions.write">
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer la première prescription
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {groupes.map(groupe => {
            const isExpanded = expandedKey === groupe.key;
            const nbMeds     = groupe.items.length;

            return (
              <div key={groupe.key}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all border-l-4 border-l-cyan-500">

                {/* ── En-tête du groupe ── */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1.5">
                          <FileText className="w-3 h-3" />
                          {groupe.type}
                        </span>
                        {/* Badge nombre de médicaments si > 1 */}
                        {nbMeds > 1 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {nbMeds} médicaments
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {format(new Date(groupe.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {groupe.heure}
                        </span>
                        {groupe.prescripteur && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {groupe.prescripteur}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* PDF — premier médicament du groupe */}
                      <button
                        onClick={() => handleDownloadPDF(groupe.items[0].id_traitement)}
                        disabled={downloading === groupe.items[0].id_traitement}
                        title="Télécharger en PDF"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50">
                        {downloading === groupe.items[0].id_traitement
                          ? <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          : <Download className="w-3.5 h-3.5" />
                        }
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      {/* Accordion toggle */}
                      <button
                        onClick={() => setExpandedKey(isExpanded ? null : groupe.key)}
                        title={isExpanded ? 'Réduire' : 'Voir les médicaments'}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-xs font-medium flex items-center gap-1.5">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isExpanded ? 'Réduire' : `Voir (${nbMeds})`}</span>
                      </button>
                    </div>
                  </div>

                  {/* Diagnostic (toujours visible) */}
                  {groupe.diagnostic && (
                    <div className="mt-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Diagnostic</p>
                      <p className="text-sm text-gray-800">{groupe.diagnostic}</p>
                    </div>
                  )}

                  {/* Aperçu médicaments quand réduit — pills */}
                  {!isExpanded && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {groupe.items.map(t => (
                        <span key={t.id_traitement}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                          <Pill className="w-3 h-3 text-cyan-500" />
                          {t.medicament}
                          <span className="text-gray-400">— {t.dosage}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Détails médicaments (accordion) ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4 space-y-3">
                    {groupe.items.map((t, i) => (
                      <div key={t.id_traitement} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                            <Pill className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">
                              {nbMeds > 1 && <span className="text-gray-400 font-normal mr-1">#{i + 1}</span>}
                              {t.medicament}
                              <span className="font-normal text-gray-600 ml-1">— {t.dosage}</span>
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Voie</p>
                                <p className="text-xs text-gray-700">{t.voie_administration}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Fréquence</p>
                                <p className="text-xs text-gray-700">{t.frequence}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase">Durée</p>
                                <p className="text-xs text-gray-700">{t.duree}</p>
                              </div>
                              {t.lieu_prescription && (
                                <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Lieu</p>
                                  <p className="text-xs text-gray-700">{t.lieu_prescription}</p>
                                </div>
                              )}
                            </div>
                            {t.instructions && (
                              <p className="mt-2 text-xs text-gray-600 italic border-l-2 border-gray-200 pl-2">
                                {t.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Observations spéciales du groupe */}
                    {groupe.items[0].observations_speciales && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Observations spéciales</p>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{groupe.items[0].observations_speciales}</p>
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