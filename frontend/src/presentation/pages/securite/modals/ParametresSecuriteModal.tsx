// frontend/src/presentation/pages/securite/modals/ParametresSecuriteModal.tsx

import { useState, useEffect } from 'react';
import {
  X, Settings, Save, Info, Key, Clock, Shield,
  Bell, CheckCircle2, AlertTriangle, RefreshCw, Database
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import axios from 'axios';
import { toast } from 'sonner';

interface Parametre {
  cle:         string;
  valeur:      string;
  type:        string;
  description: string;
}

interface ParametresGroup {
  [categorie: string]: Parametre[];
}

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function ParametresSecuriteModal({ isOpen, onClose }: Props) {
  const [loading,         setLoading]         = useState(false);
  const [loadError,       setLoadError]       = useState<string | null>(null);
  const [saving,          setSaving]          = useState<string | null>(null); // cle en cours
  const [parametres,      setParametres]      = useState<ParametresGroup>({});
  const [modifiedValues,  setModifiedValues]  = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) loadParametres();
  }, [isOpen]);

  const loadParametres = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await httpClient.get('/securite/parametres');
      setParametres(response.data.data || {});
      setModifiedValues({});
    } catch (error) {
      console.error('❌ [Paramètres] Erreur:', error);
      setLoadError('Impossible de charger les paramètres de sécurité.');
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (cle: string, valeur: string) =>
    setModifiedValues(prev => ({ ...prev, [cle]: valeur }));

  const handleSave = async (cle: string) => {
    try {
      setSaving(cle);
      await httpClient.put(`/securite/parametres/${cle}`, { valeur: modifiedValues[cle] });
      toast.success('Paramètre mis à jour');
      setModifiedValues(prev => {
        const s = { ...prev };
        delete s[cle];
        return s;
      });
      loadParametres();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(null);
    }
  };

  const getValue  = (param: Parametre) =>
    modifiedValues[param.cle] !== undefined ? modifiedValues[param.cle] : param.valeur;
  const isModified = (cle: string) => modifiedValues[cle] !== undefined;

  const nbModified = Object.keys(modifiedValues).length;

  // ── Icônes et labels catégories ───────────────────────────────────────────
  const getCategoryIcon = (cat: string) => ({
    password: Key, session: Clock, '2fa': Shield,
    notifications: Bell, logs: Database,
  } as Record<string, typeof Key>)[cat] || Settings;

  const getCategoryTitle = (cat: string) => ({
    password:      'Mots de passe',
    session:       'Sessions et connexions',
    '2fa':         'Authentification à deux facteurs',
    notifications: 'Alertes et notifications',
    logs:          'Journalisation',
  } as Record<string, string>)[cat] || cat;

  const getCategoryDescription = (cat: string) => ({
    password:      'Règles de complexité pour les mots de passe. Des règles strictes protègent mieux vos données médicales.',
    session:       'Durée des sessions et protection contre les tentatives de connexion répétées.',
    '2fa':         'Couche de sécurité supplémentaire avec un code unique à chaque connexion.',
    notifications: 'Alertes automatiques en cas d\'activité suspecte sur votre application.',
    logs:          'Paramètres de journalisation des actions utilisateurs.',
  } as Record<string, string>)[cat] || '';

  // ── Rendu champ selon type ────────────────────────────────────────────────
  const renderField = (param: Parametre) => {
    const value    = getValue(param);
    const modified = isModified(param.cle);
    const isSavingThis = saving === param.cle;

    const inputBase = 'px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all';
    const inputCls  = modified
      ? `${inputBase} border-orange-300 bg-orange-50 focus:ring-orange-100`
      : `${inputBase} border-gray-200 focus:border-cyan-400 focus:ring-cyan-100`;

    const SaveBtn = () => modified ? (
      <button onClick={() => handleSave(param.cle)} disabled={!!saving}
        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5 transition-all active:scale-95 shrink-0">
        {isSavingThis
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Save className="w-4 h-4" />
        }
        {isSavingThis ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    ) : null;

    if (param.type === 'boolean') {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <div
            onClick={() => handleChange(param.cle, value === 'true' ? 'false' : 'true')}
            className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${
              value === 'true' ? 'bg-cyan-600' : 'bg-gray-200'
            }`}>
            <span className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform ${
              value === 'true' ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
            <input type="checkbox" checked={value === 'true'} readOnly
              aria-label={param.description} className="sr-only" />
          </div>
          <span className={`text-sm font-medium ${value === 'true' ? 'text-cyan-700' : 'text-gray-500'}`}>
            {value === 'true' ? '✅ Activé' : '⬜ Désactivé'}
          </span>
          <SaveBtn />
        </div>
      );
    }

    if (param.type === 'number') {
      return (
        <div className="flex items-center gap-3">
          <input type="number" value={value} aria-label={param.description}
            onChange={e => handleChange(param.cle, e.target.value)}
            className={`flex-1 ${inputCls}`} />
          <SaveBtn />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <input type="text" value={value} aria-label={param.description}
          onChange={e => handleChange(param.cle, e.target.value)}
          className={`flex-1 ${inputCls}`} />
        <SaveBtn />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header — cyan uniforme ── */}
        <div className="bg-cyan-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Paramètres de Sécurité</h2>
              <p className="text-sm text-cyan-100">
                {nbModified > 0
                  ? `${nbModified} modification${nbModified > 1 ? 's' : ''} non sauvegardée${nbModified > 1 ? 's' : ''}`
                  : 'Configuration de votre application'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadParametres} disabled={loading} title="Rafraîchir"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} title="Fermer" aria-label="Fermer la fenêtre"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Contenu ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* État erreur */}
          {loadError && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-800 font-medium mb-1">Impossible de charger les paramètres</p>
              <p className="text-red-600 text-sm mb-4">{loadError}</p>
              <button onClick={loadParametres}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" />Réessayer
              </button>
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des paramètres...</p>
              </div>
            </div>
          )}

          {!loading && !loadError && (
            <>
              {/* Conseil */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">Valeurs recommandées</p>
                  <p>Les paramètres par défaut sont optimisés pour un usage médical sécurisé.
                     Modifiez-les uniquement si nécessaire.</p>
                </div>
              </div>

              {/* Avertissement modifications en attente */}
              {nbModified > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                  <p className="text-sm text-orange-800 font-medium">
                    {nbModified} modification{nbModified > 1 ? 's' : ''} non sauvegardée{nbModified > 1 ? 's' : ''} — cliquez "Enregistrer" sur chaque paramètre modifié.
                  </p>
                </div>
              )}

              {/* Catégories */}
              {Object.entries(parametres).map(([categorie, params]) => {
                const CategoryIcon = getCategoryIcon(categorie);
                return (
                  <div key={categorie} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* En-tête catégorie — gris neutre */}
                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-start gap-3">
                      <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                        <CategoryIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{getCategoryTitle(categorie)}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{getCategoryDescription(categorie)}</p>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {params.map(param => (
                        <div key={param.cle}
                          className={`pb-5 border-b border-gray-100 last:border-0 last:pb-0 ${
                            isModified(param.cle) ? 'bg-orange-50/50 -mx-5 px-5 py-3 rounded-lg' : ''
                          }`}>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <label className="block font-semibold text-gray-900 mb-0.5">
                                {param.description}
                              </label>
                              <code className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                {param.cle}
                              </code>
                            </div>
                            {isModified(param.cle) && (
                              <span className="text-xs text-orange-600 font-semibold flex items-center gap-1 shrink-0 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Non sauvegardé
                              </span>
                            )}
                          </div>
                          {renderField(param)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* État vide */}
              {Object.keys(parametres).length === 0 && (
                <div className="text-center py-16">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Aucun paramètre disponible</p>
                  <p className="text-gray-400 text-sm mt-1">La table parametres_securite est vide.</p>
                </div>
              )}

              {/* Confirmation tout sauvegardé */}
              {nbModified === 0 && Object.keys(parametres).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800">
                    Tous les paramètres sont sauvegardés. Les changements sont actifs immédiatement.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
          <p className="text-sm text-gray-500">
            {nbModified > 0
              ? <span className="text-orange-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {nbModified} modification{nbModified > 1 ? 's' : ''} non sauvegardée{nbModified > 1 ? 's' : ''}
                </span>
              : Object.keys(parametres).length > 0
                ? <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Tout est sauvegardé
                  </span>
                : null
            }
          </p>
          <button onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}