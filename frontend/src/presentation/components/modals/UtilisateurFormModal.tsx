// presentation/components/modals/UtilisateurFormModal.tsx

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type RoleType = 'admin' | 'medecin' | 'interne' | 'stagiaire' | 'infirmier' | 'secretaire';
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

interface UtilisateurFormModalProps {
  mode:        'create' | 'edit';
  initialData: UtilisateurFormData;
  onSubmit:    (data: UtilisateurFormData) => Promise<void>;
  onClose:     () => void;
}

// Rôles avec labels lisibles
const ROLES: { value: RoleType; label: string }[] = [
  { value: 'secretaire', label: 'Secrétaire'     },
  { value: 'medecin',    label: 'Médecin'         },
  { value: 'interne',    label: 'Interne'         },
  { value: 'stagiaire',  label: 'Stagiaire'       },
  { value: 'infirmier',  label: 'Infirmier'       },
  { value: 'admin',      label: 'Administrateur'  },
];

// Rôles qui ont une spécialité
const ROLES_AVEC_SPECIALITE: RoleType[] = ['medecin', 'interne', 'stagiaire'];

export function UtilisateurFormModal({ mode, initialData, onSubmit, onClose }: UtilisateurFormModalProps) {
  const [formData,    setFormData]    = useState<UtilisateurFormData>(initialData);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

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

        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nouvel Utilisateur' : "Modifier l'Utilisateur"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">

            {/* Nom */}
            <div>
              <label htmlFor="user-nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input id="user-nom" type="text" required
                value={formData.nom} placeholder="Nom de famille"
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Prénom */}
            <div>
              <label htmlFor="user-prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input id="user-prenom" type="text" required
                value={formData.prenom} placeholder="Prénom"
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input id="user-email" type="email" required
                value={formData.email} placeholder="exemple@cenhosoa.mg"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="user-telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input id="user-telephone" type="tel"
                value={formData.telephone} placeholder="+261 XX XX XXX XX"
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required={mode === 'create'}
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                  placeholder={mode === 'edit' ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select id="user-role" required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType, specialite: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Spécialité — médecin, interne, stagiaire */}
            {ROLES_AVEC_SPECIALITE.includes(formData.role) && (
              <div className="col-span-2">
                <label htmlFor="user-specialite" className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité
                </label>
                <input id="user-specialite" type="text"
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  placeholder="Ex: Cardiologie, Pédiatrie..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* Statut */}
            <div className="col-span-2">
              <label htmlFor="user-statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select id="user-statut"
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
              {submitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}