import { useState } from 'react';
import { FileText, Calendar, CheckCircle2, ArrowRight, Plus, Download, Printer } from 'lucide-react';
import { useComptesRendus } from '../../../hooks/useComptesRendus';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateCompteRenduDTO } from '../../../../core/entities/CompteRendu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddCompteRenduModal from './AddCompteRenduModal';
import { PermissionGuard } from '../../common/PermissionGuard';
import { SignatureBadge } from '../../common/SignatureBadge';
import { toast } from 'sonner';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { compteRenduToHTML } from '../../../../shared/utils/printCompteRendu';
import { printHTML } from '../../../../shared/utils/printUtils';
import AjouterPieceJointeButton from '../../common/AjouterPieceJointeButton';

interface ComptesRendusTabProps {
  patient: Patient;
  idAdmission?: number;
}

export default function ComptesRendusTab({ patient, idAdmission }: ComptesRendusTabProps) {
  const { comptesRendus, loading, error, createCompteRendu } = useComptesRendus(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);
  const [downloading,  setDownloading]  = useState<number | null>(null);

  const handleCreateCompteRendu = async (data: CreateCompteRenduDTO) => {
    await createCompteRendu(data);
    setShowAddModal(false);
  };

  const handleDownloadPDF = async (crId: number) => {
    setDownloading(crId);
    try {
      const response = await httpClient.get(`/comptes-rendus/${crId}/pdf`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compte_rendu_${crId}_${patient.nom_patient}.pdf`);
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

  const handlePrintCR = (cr: typeof comptesRendus[0]) => {
    const html = compteRenduToHTML(patient, cr);
    printHTML(html, `Compte rendu — ${patient.nom_patient} ${patient.prenom_patient}`);
  };

  // Chargement / erreur

  if (loading && comptesRendus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
        <p className="text-sm text-gray-500">Chargement des comptes rendus...</p>
      </div>
    );
  }

  if (error && comptesRendus.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <p className="text-red-600 text-sm mt-1">Veuillez réessayer ou contacter l'administrateur.</p>
      </div>
    );
  }

  if (patient.statut_patient !== 'hospitalise') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-gray-400" />
        </div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Non disponible</h4>
        <p className="text-xs text-gray-500">
          Les comptes rendus d'hospitalisation ne sont disponibles que pour les patients hospitalisés.
        </p>
      </div>
    );
  }

  // Rendu

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Comptes rendus d'hospitalisation</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {comptesRendus.length === 0
              ? 'Aucun compte rendu enregistré'
              : `${comptesRendus.length} compte${comptesRendus.length > 1 ? 's' : ''} rendu${comptesRendus.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        <PermissionGuard permission="compte-rendu.write">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-sm font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau compte rendu
          </button>
        </PermissionGuard>
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddCompteRenduModal
          patient={patient}
          idAdmission={idAdmission}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateCompteRendu}
        />
      )}

      {/* Etat vide */}
      {comptesRendus.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aucun compte rendu d'hospitalisation</h4>
          <p className="text-xs text-gray-500 mb-5">Le compte rendu de fin d'hospitalisation apparaîtra ici.</p>
          <PermissionGuard permission="compte-rendu.write">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-lg transition-all shadow-md text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer le premier compte rendu
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <div className="space-y-5">
          {comptesRendus.map((cr) => (
            <div
              key={cr.id_compte_rendu}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-cyan-500"
            >
              {/* En-tete */}
              <div className="p-5 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                        Hospitalisation
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Admission : {format(new Date(cr.date_admission), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-300" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Sortie : {format(new Date(cr.date_sortie), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePrintCR(cr)}
                      title="Imprimer"
                      className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs">
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Imprimer</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(cr.id_compte_rendu)}
                      disabled={downloading === cr.id_compte_rendu}
                      title="Télécharger en PDF"
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-all font-medium flex items-center gap-1.5 text-xs disabled:opacity-50"
                    >
                      {downloading === cr.id_compte_rendu
                        ? <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        : <Download className="w-3.5 h-3.5" />
                      }
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>

                <SignatureBadge
                  nom={`Dr. ${cr.medecin}`}
                  date={String(cr.date_sortie)}
                  role="medecin"
                />
              </div>

              <div className="mt-3">
                <AjouterPieceJointeButton
                  entiteType="compte_rendu"
                  entiteId={cr.id_compte_rendu}
                  patientId={patient.id_patient}
                />
              </div>

              {/* Corps — ordre calque sur le document reel du service */}
              <div className="p-5 sm:p-6 space-y-4">

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Diagnostic
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900">{cr.diagnostic}</p>
                  </div>
                </div>

                {cr.contexte && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Contexte</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.contexte}</p>
                    </div>
                  </div>
                )}

                {cr.examens_paracliniques && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Examens paracliniques</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.examens_paracliniques}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Résumé de l'observation</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.resume_observation}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Traitement de sortie</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.traitement_sortie}</p>
                  </div>
                </div>

                {cr.evolution && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Evolution</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.evolution}</p>
                    </div>
                  </div>
                )}

                {cr.prochain_rdv && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Prochain rendez-vous
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{cr.prochain_rdv}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}