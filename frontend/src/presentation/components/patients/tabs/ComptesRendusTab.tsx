import { useComptesRendus } from '../../../hooks/useComptesRendus';
import type { Patient } from '../../../../core/entities/Patient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ComptesRendusTabProps {
  patient: Patient;
}

export default function ComptesRendusTab({ patient }: ComptesRendusTabProps) {
  const { comptesRendus, loading, error } = useComptesRendus(patient.id_patient);

  const getModaliteBadge = (modalite: string) => {
    const badges = {
      gueri: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Guéri' },
      ameliore: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '↗', label: 'Amélioré' },
      transfert: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '→', label: 'Transféré' },
      deces: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✝', label: 'Décès' },
    };
    return badges[modalite as keyof typeof badges] || badges.ameliore;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  // Note: Cet onglet n'apparaît que pour les patients hospitalisés
  if (patient.statut_patient !== 'hospitalise') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800">
          ℹ️ Les comptes rendus d'hospitalisation ne sont disponibles que pour les patients hospitalisés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Comptes rendus d'hospitalisation ({comptesRendus.length})
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Nouveau compte rendu
        </button>
      </div>

      {/* Liste des comptes rendus */}
      {comptesRendus.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Aucun compte rendu d'hospitalisation</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comptesRendus.map((cr) => {
            const badge = getModaliteBadge(cr.modalite_sortie);
            
            return (
              <div key={cr.id_compte_rendu} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                {/* En-tête */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Hospitalisation
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        📅 Admission : {format(new Date(cr.date_admission), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <span>→</span>
                      <span>
                        📅 Sortie : {format(new Date(cr.date_sortie), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.icon} {badge.label}
                  </span>
                </div>

                {/* Médecin */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Médecin responsable</p>
                  <p className="text-base font-semibold text-gray-900">Dr. {cr.medecin}</p>
                </div>

                {/* Résumé de l'observation */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Résumé de l'observation</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{cr.resume_observation}</p>
                  </div>
                </div>

                {/* Diagnostic de sortie */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Diagnostic de sortie</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900">{cr.diagnostic_sortie}</p>
                  </div>
                </div>

                {/* Traitement de sortie */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Traitement de sortie</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900 whitespace-pre-line">{cr.traitement_sortie}</p>
                  </div>
                </div>

                {/* Lieu de transfert (si applicable) */}
                {cr.lieu_transfert && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Lieu de transfert</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-orange-900">📍 {cr.lieu_transfert}</p>
                    </div>
                  </div>
                )}

                {/* Prochain rendez-vous */}
                {cr.prochain_rdv && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-amber-800 uppercase mb-1">📅 Prochain rendez-vous</p>
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