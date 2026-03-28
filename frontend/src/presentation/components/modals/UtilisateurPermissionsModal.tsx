// presentation/components/modals/UtilisateurPermissionsModal.tsx

import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, Loader2, X } from 'lucide-react';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS } from '../../../shared/constants/permissions.constants';
import { toast } from 'sonner';

interface Utilisateur {
  id_user: number;
  nom:     string;
  prenom:  string;
  role:    string;
}

interface UtilisateurPermissionsModalProps {
  utilisateur: Utilisateur;
  onClose:     () => void;
}

// ── Groupes — miroir exact des onglets du dossier patient ─────────────────────

const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
  {
    label:       'Patients',
    permissions: ['patients.read', 'patients.write'],
  },
  {
    label:       'Admissions',
    permissions: ['admissions.read', 'admissions.write'],
  },
  {
    label:       'Observations',
    permissions: ['observations.read', 'observations.write'],
  },
  {
    label:       'Prescriptions',
    permissions: ['prescriptions.read', 'prescriptions.write'],
  },
  {
    label:       'Soins médicaux',
    permissions: ['soins-medicaux.read', 'soins-medicaux.write'],
  },
  {
    label:       'Soins infirmiers',
    permissions: ['soins-infirmiers.read', 'soins-infirmiers.write'],
  },
  {
    label:       'Bilans biologiques',
    permissions: ['bilans.read', 'bilans.write'],
  },
  {
    label:       'Lits',
    permissions: ['lits.read', 'lits.write'],
  },
  {
    label:       'Documents',
    permissions: ['documents.read', 'documents.write', 'documents.export'],
  },
  {
    label:       'Compte rendu',
    permissions: ['compte-rendu.read', 'compte-rendu.write'],
  },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export function UtilisateurPermissionsModal({ utilisateur, onClose }: UtilisateurPermissionsModalProps) {
  const isAdmin = utilisateur.role === 'admin';

  const [checked,      setChecked]      = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);

  useEffect(() => {
    if (isAdmin) { setLoading(false); return; }
    const load = async () => {
      try {
        const response = await httpClient.get(`/utilisateurs/${utilisateur.id_user}/permissions`);
        const data     = response.data.data;
        setChecked(new Set(data.permissions));
        setIsCustomized(data.isCustomized);
      } catch {
        const defaults = DEFAULT_PERMISSIONS[utilisateur.role] ?? [];
        setChecked(new Set(defaults));
        toast.error('Impossible de charger les permissions — défauts appliqués');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [utilisateur.id_user, utilisateur.role, isAdmin]);

  const toggle = (perm: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else                next.add(perm);
      return next;
    });
  };

  const toggleGroup = (permissions: string[]) => {
    const allChecked = permissions.every(p => checked.has(p));
    setChecked(prev => {
      const next = new Set(prev);
      if (allChecked) permissions.forEach(p => next.delete(p));
      else            permissions.forEach(p => next.add(p));
      return next;
    });
  };

  const handleReset = () => {
    const defaults = DEFAULT_PERMISSIONS[utilisateur.role] ?? [];
    setChecked(new Set(defaults));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await httpClient.put(`/utilisateurs/${utilisateur.id_user}/permissions`, {
        permissions: Array.from(checked),
      });
      toast.success('Permissions sauvegardées avec succès');
      setIsCustomized(true);
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde des permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-cyan-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Permissions — {utilisateur.prenom} {utilisateur.nom}
              </h2>
              <p className="text-cyan-100 text-xs capitalize flex items-center gap-2">
                Rôle : {utilisateur.role}
                {isCustomized && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Personnalisé
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            title="Enregistrer les modifications"
            aria-label="Action de permission"
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6">
          {isAdmin ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Accès Administrateur Complet</h3>
              <p className="text-gray-500">Cet utilisateur a accès à toutes les fonctionnalités sans restriction.</p>
            </div>

          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>

          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-cyan-600">{checked.size}</span> permission{checked.size > 1 ? 's' : ''} activée{checked.size > 1 ? 's' : ''}
                </p>
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-600 transition-colors font-medium">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser aux défauts du rôle
                </button>
              </div>

              <div className="space-y-3">
                {PERMISSION_GROUPS.map(group => {
                  const allChecked  = group.permissions.every(p => checked.has(p));
                  const someChecked = group.permissions.some(p => checked.has(p));

                  return (
                    <div key={group.label} className="border border-gray-200 rounded-xl overflow-hidden">

                      {/* En-tête groupe */}
                      <button onClick={() => toggleGroup(group.permissions)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          allChecked ? 'bg-cyan-50' : someChecked ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-cyan-50`}
                      >
                        <span className="font-semibold text-gray-800 text-sm">{group.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {group.permissions.filter(p => checked.has(p)).length}/{group.permissions.length}
                          </span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            allChecked
                              ? 'bg-cyan-500 border-cyan-500'
                              : someChecked
                              ? 'bg-cyan-100 border-cyan-400'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {allChecked  && <span className="text-white text-[11px] font-bold leading-none">✓</span>}
                            {someChecked && !allChecked && <span className="text-cyan-600 text-[11px] font-bold leading-none">–</span>}
                          </div>
                        </div>
                      </button>

                      {/* Permissions */}
                      <div className="divide-y divide-gray-100">
                        {group.permissions.map(perm => {
                          const isChecked = checked.has(perm);
                          return (
                            <label key={perm}
                              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                isChecked ? 'bg-cyan-50/50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div onClick={() => toggle(perm)}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-cyan-500 border-cyan-500'
                                    : 'border-gray-300 bg-white hover:border-cyan-400'
                                }`}
                              >
                                {isChecked && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isChecked ? 'text-cyan-700' : 'text-gray-700'}`}>
                                  {PERMISSION_LABELS[perm] ?? perm}
                                </p>
                                <p className="text-xs text-gray-400">{perm}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isAdmin && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
            <button onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-cyan-100">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</>
                : <><Save className="w-4 h-4" />Sauvegarder</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}