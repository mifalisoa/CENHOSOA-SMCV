// presentation/components/modals/UtilisateurFormModal.tsx

import { useState } from 'react';
import { Mail, Info, KeyRound } from 'lucide-react';

type RoleType   = 'admin' | 'medecin' | 'interne' | 'stagiaire' | 'infirmier' | 'secretaire';
type StatutType = 'actif' | 'inactif' | 'suspendu';

export interface UtilisateurFormData {
  nom:          string;
  prenom:       string;
  email:        string;
  mot_de_passe: string;
  role:         RoleType;
  telephone:    string;
  specialite:   string;
  statut:       StatutType;
}

interface Props {
  mode:        'create' | 'edit';
  initialData: UtilisateurFormData;
  onSubmit:    (data: UtilisateurFormData) => Promise<void>;
  onClose:     () => void;
}

const ROLES: { value: RoleType; label: string }[] = [
  { value: 'secretaire', label: 'Secrétaire'    },
  { value: 'medecin',    label: 'Médecin'        },
  { value: 'interne',    label: 'Interne'        },
  { value: 'stagiaire',  label: 'Stagiaire'      },
  { value: 'infirmier',  label: 'Infirmier'      },
  { value: 'admin',      label: 'Administrateur' },
];

const ROLES_AVEC_SPECIALITE: RoleType[] = ['medecin', 'interne', 'stagiaire'];

export function UtilisateurFormModal({ mode, initialData, onSubmit, onClose }: Props) {
  const [formData,   setFormData]   = useState<UtilisateurFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-cyan-600 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Nouvel Utilisateur' : "Modifier l'Utilisateur"}
          </h2>
          <p className="text-cyan-100 text-sm mt-0.5">
            {mode === 'create'
              ? 'Un mot de passe temporaire sera envoyé par email'
              : 'Modifiez les informations de l\'utilisateur'
            }
          </p>
        </div>

        {/* Info création */}
        {mode === 'create' && (
          <div className="bg-cyan-50 border-b border-cyan-200 px-6 py-3 flex items-start gap-2">
            <Mail className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p className="text-cyan-800 text-xs">
              Un mot de passe temporaire sera généré automatiquement et envoyé par email.
              L'utilisateur devra le changer à sa première connexion.
            </p>
          </div>
        )}

        {/* Info édition — mot de passe */}
        {mode === 'edit' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs">
              Pour modifier le mot de passe, utilisez l'option <strong>"Réinitialiser mot de passe"</strong> dans le menu actions de l'utilisateur.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">

            {/* Nom */}
            <div>
              <label htmlFor="user-nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input id="user-nom" type="text" required
                value={formData.nom} placeholder="Nom de famille"
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>

            {/* Prénom */}
            <div>
              <label htmlFor="user-prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input id="user-prenom" type="text" required
                value={formData.prenom} placeholder="Prénom"
                onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input id="user-email" type="email" required
                value={formData.email} placeholder="exemple@cenhosoa.mg"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="user-telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input id="user-telephone" type="tel"
                value={formData.telephone} placeholder="+261 XX XX XXX XX"
                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select id="user-role" required value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as RoleType, specialite: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label htmlFor="user-statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select id="user-statut" value={formData.statut}
                onChange={e => setFormData({ ...formData, statut: e.target.value as StatutType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>

            {/* Spécialité */}
            {ROLES_AVEC_SPECIALITE.includes(formData.role) && (
              <div className="col-span-2">
                <label htmlFor="user-specialite" className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité
                </label>
                <input id="user-specialite" type="text"
                  value={formData.specialite}
                  onChange={e => setFormData({ ...formData, specialite: e.target.value })}
                  placeholder="Ex: Cardiologie, Pédiatrie..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>
            )}

            {/* Info mode création */}
            {mode === 'create' && (
              <div className="col-span-2 bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-xs text-gray-500">
                  Le mot de passe temporaire sera généré automatiquement et envoyé par email à l'utilisateur.
                </p>
              </div>
            )}

          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'create' ? 'Envoi en cours...' : 'Enregistrement...'}
                </span>
              ) : mode === 'create' ? (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />Créer et envoyer email
                </span>
              ) : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}