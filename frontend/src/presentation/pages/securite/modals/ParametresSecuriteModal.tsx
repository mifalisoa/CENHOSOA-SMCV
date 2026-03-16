// frontend/src/presentation/pages/securite/modals/ParametresSecuriteModal.tsx

import { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Save,
  Info,
  Key,
  Clock,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import axios from 'axios';
import { toast } from 'sonner';

interface Parametre {
  cle: string;
  valeur: string;
  type: string;
  description: string;
}

interface ParametresGroup {
  [categorie: string]: Parametre[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParametresSecuriteModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parametres, setParametres] = useState<ParametresGroup>({});
  const [modifiedValues, setModifiedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadParametres();
    }
  }, [isOpen]);

  const loadParametres = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/securite/parametres');
      setParametres(response.data.data || {});
      setModifiedValues({});
    } catch (error) {
      console.error('❌ [Paramètres] Erreur:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (cle: string, valeur: string) => {
    setModifiedValues(prev => ({ ...prev, [cle]: valeur }));
  };

  const handleSave = async (cle: string) => {
    try {
      setSaving(true);
      const valeur = modifiedValues[cle];
      await httpClient.put(`/securite/parametres/${cle}`, { valeur });
      toast.success('Paramètre mis à jour');
      setModifiedValues(prev => {
        const newState = { ...prev };
        delete newState[cle];
        return newState;
      });
      loadParametres();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  const getValue = (param: Parametre) =>
    modifiedValues[param.cle] !== undefined ? modifiedValues[param.cle] : param.valeur;

  const isModified = (cle: string) => modifiedValues[cle] !== undefined;

  const getCategoryIcon = (categorie: string) => {
    switch (categorie) {
      case 'password': return Key;
      case 'session': return Clock;
      case '2fa': return Shield;
      case 'notifications': return Bell;
      default: return Settings;
    }
  };

  const getCategoryTitle = (categorie: string) => {
    switch (categorie) {
      case 'password': return 'Mots de passe';
      case 'session': return 'Sessions et connexions';
      case '2fa': return 'Authentification à deux facteurs (2FA)';
      case 'notifications': return 'Notifications';
      default: return categorie;
    }
  };

  const getCategoryDescription = (categorie: string) => {
    switch (categorie) {
      case 'password':
        return 'Règles pour les mots de passe des utilisateurs. Des mots de passe complexes protègent mieux vos données.';
      case 'session':
        return 'Durée des connexions et sécurité des sessions. Une durée limitée empêche les accès non autorisés.';
      case '2fa':
        return "Sécurité supplémentaire avec un code unique à chaque connexion. Recommandé pour les admins.";
      case 'notifications':
        return "Alertes par email en cas d'activité suspecte. Vous serez prévenu des problèmes de sécurité.";
      default:
        return '';
    }
  };

  const renderParametreField = (param: Parametre) => {
    const value = getValue(param);
    const modified = isModified(param.cle);

    if (param.type === 'boolean') {
      return (
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleChange(param.cle, e.target.checked ? 'true' : 'false')}
              aria-label={param.description}  // ← fix ligne 138
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08C5D1]"></div>
          </label>
          <span className="text-sm text-gray-600">
            {value === 'true' ? 'Activé' : 'Désactivé'}
          </span>
          {modified && (
            <button
              onClick={() => handleSave(param.cle)}
              disabled={saving}
              className="ml-auto px-3 py-1 bg-[#08C5D1] text-white rounded-lg text-sm font-medium hover:bg-[#06B3BF] disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          )}
        </div>
      );
    }

    if (param.type === 'number') {
      return (
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(param.cle, e.target.value)}
            aria-label={param.description}  // ← fix ligne 166
            placeholder={param.description}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08C5D1] focus:border-transparent outline-none"
          />
          {modified && (
            <button
              onClick={() => handleSave(param.cle)}
              disabled={saving}
              className="px-4 py-2 bg-[#08C5D1] text-white rounded-lg font-medium hover:bg-[#06B3BF] disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(param.cle, e.target.value)}
          aria-label={param.description}  // ← fix ligne 188
          placeholder={param.description}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08C5D1] focus:border-transparent outline-none"
        />
        {modified && (
          <button
            onClick={() => handleSave(param.cle)}
            disabled={saving}
            className="px-4 py-2 bg-[#08C5D1] text-white rounded-lg font-medium hover:bg-[#06B3BF] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Paramètres de Sécurité</h2>
              <p className="text-sm text-white/80">Configuration simple et sécurisée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fermer"                          // ← fix ligne 222
            aria-label="Fermer la fenêtre"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#08C5D1] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avertissement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">💡 Conseil</p>
                    <p>
                      Les valeurs par défaut sont recommandées pour un usage médical.
                      Ne modifiez ces paramètres que si vous savez ce que vous faites.
                    </p>
                  </div>
                </div>
              </div>

              {/* Catégories */}
              {Object.entries(parametres).map(([categorie, params]) => {
                const CategoryIcon = getCategoryIcon(categorie);
                return (
                  <div key={categorie} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] p-4">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-6 h-6 text-white" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{getCategoryTitle(categorie)}</h3>
                          <p className="text-sm text-white/90 mt-1">{getCategoryDescription(categorie)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {params.map(param => (
                        <div key={param.cle} className="pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <label className="block font-semibold text-gray-900 mb-1">
                                {param.description}
                              </label>
                              <p className="text-sm text-gray-500 mb-3">
                                💡 Paramètre : <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{param.cle}</code>
                              </p>
                            </div>
                            {isModified(param.cle) && (
                              <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                Non sauvegardé
                              </div>
                            )}
                          </div>
                          {renderParametreField(param)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Info sécurité */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-1">✅ Paramètres sécurisés</p>
                    <p>
                      Tous vos paramètres sont stockés de manière sécurisée.
                      Les changements prennent effet immédiatement pour tous les utilisateurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {Object.values(modifiedValues).length > 0 && (
              <span className="text-orange-600 font-medium">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {Object.values(modifiedValues).length} modification{Object.values(modifiedValues).length > 1 ? 's' : ''} non sauvegardée{Object.values(modifiedValues).length > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}