// presentation/components/modals/UtilisateurPermissionsModal.tsx

import { CheckCircle, Shield } from 'lucide-react';
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS } from '../../../shared/constants/permissions.constants';

interface Utilisateur {
  id_user: number;   // était id_utilisateur
  nom: string;
  prenom: string;
  role: string;
}

interface UtilisateurPermissionsModalProps {
  utilisateur: Utilisateur;
  onClose: () => void;
}

export function UtilisateurPermissionsModal({ utilisateur, onClose }: UtilisateurPermissionsModalProps) {
  const permissions = DEFAULT_PERMISSIONS[utilisateur.role] || [];
  const isAdmin = utilisateur.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Permissions de {utilisateur.prenom} {utilisateur.nom}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Rôle : <span className="font-semibold capitalize">{utilisateur.role}</span>
          </p>
        </div>

        <div className="p-6">
          {isAdmin ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Accès Administrateur Complet</h3>
              <p className="text-gray-600">Cet utilisateur a accès à toutes les fonctionnalités sans restriction</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((perm: string) => (
                <div key={perm} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">{PERMISSION_LABELS[perm] || perm}</p>
                    <p className="text-xs text-green-700">{perm}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}