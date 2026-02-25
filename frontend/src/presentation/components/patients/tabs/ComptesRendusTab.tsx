import { useState } from 'react';
import { FileText, Calendar, CheckCircle2, TrendingUp, ArrowRight, Skull, MapPin } from 'lucide-react';
import { useComptesRendus } from '../../../hooks/useComptesRendus';
import type { Patient } from '../../../../core/entities/Patient';
import type { CreateCompteRenduDTO } from '../../../../core/entities/CompteRendu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddCompteRenduModal from './AddCompteRenduModal';

interface ComptesRendusTabProps {
  patient: Patient;
}

export default function ComptesRendusTab({ patient }: ComptesRendusTabProps) {
  const { comptesRendus, loading, error, createCompteRendu } = useComptesRendus(patient.id_patient);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateCompteRendu = async (data: CreateCompteRenduDTO) => {
    await createCompteRendu(data);
    setShowAddModal(false);
  };

  const getModaliteBadge = (modalite: string) => {
    const badges = {
      gueri: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        border: 'border-green-300',
        icon: CheckCircle2, 
        label: 'Guéri' 
      },
      ameliore: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-300',
        icon: TrendingUp, 
        label: 'Amélioré' 
      },
      transfert: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        border: 'border-orange-300',
        icon: ArrowRight, 
        label: 'Transféré' 
      },
      deces: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-300',
        icon: Skull, 
        label: 'Décès' 
      },
    };
    return badges[modalite as keyof typeof badges] || badges.ameliore;
  };

  if (loading && comptesRendus.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && comptesRendus.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  // Note: Cet onglet n'apparaît que pour les patients hospitalisés
  if (patient.statut_patient !== 'hospitalise') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <p className="text-blue-800 font-medium">
          Les comptes rendus d'hospitalisation ne sont disponibles que pour les patients hospitalisés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Comptes rendus d'hospitalisation ({comptesRendus.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm font-medium flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Nouveau compte rendu
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddCompteRenduModal
          patient={patient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateCompteRendu}
        />
      )}

      {/* Liste des comptes rendus */}
      {comptesRendus.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-3">Aucun compte rendu d'hospitalisation</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Créer le premier compte rendu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {comptesRendus.map((cr) => {
            const badge = getModaliteBadge(cr.modalite_sortie);
            const BadgeIcon = badge.icon;
            
            return (
              <div 
                key={cr.id_compte_rendu} 
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500"
              >
                {/* En-tête */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      Hospitalisation
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Admission : {format(new Date(cr.date_admission), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Sortie : {format(new Date(cr.date_sortie), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center gap-2 ${badge.bg} ${badge.text} ${badge.border}`}>
                    <BadgeIcon className="w-4 h-4" />
                    {badge.label}
                  </span>
                </div>

                {/* Médecin */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Médecin responsable
                  </p>
                  <p className="text-base font-semibold text-gray-900">Dr. {cr.medecin}</p>
                </div>

                {/* Résumé de l'observation */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Résumé de l'observation
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{cr.resume_observation}</p>
                  </div>
                </div>

                {/* Diagnostic de sortie */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Diagnostic de sortie
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900">{cr.diagnostic_sortie}</p>
                  </div>
                </div>

                {/* Traitement de sortie */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Traitement de sortie
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900 whitespace-pre-line leading-relaxed">{cr.traitement_sortie}</p>
                  </div>
                </div>

                {/* Lieu de transfert (si applicable) */}
                {cr.lieu_transfert && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Lieu de transfert
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-orange-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {cr.lieu_transfert}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prochain rendez-vous */}
                {cr.prochain_rdv && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Prochain rendez-vous
                    </p>
                    <p className="text-sm font-semibold text-amber-900">{cr.prochain_rdv}</p>
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