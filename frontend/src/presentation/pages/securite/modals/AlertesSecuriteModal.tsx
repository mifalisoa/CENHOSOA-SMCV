// frontend/src/presentation/pages/securite/modals/AlertesSecuriteModal.tsx
//
// NOUVEAU. GET /securite/alertes et PATCH /securite/alertes/:id existaient
// deja cote backend (logLoginFailed cree une vraie alerte apres N echecs de
// connexion depuis une IP), mais aucune interface ne permettait de les voir.
// C'etait la seule vraie fonctionnalite de securite manquante -- pas de
// blocage IP, pas de parametres live, juste : voir les alertes, les marquer
// comme traitees.

import { useState, useEffect, useCallback } from 'react';
import {
  X, AlertTriangle, RefreshCw, CheckCircle, Clock, Globe, User,
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Alerte {
  id_alerte:           number;
  type_alerte:         string;
  severite:            string;
  titre:               string;
  message:             string;
  ip_address:          string | null;
  id_utilisateur:      number | null;
  utilisateur_nom:     string | null;
  utilisateur_prenom:  string | null;
  lue:                 boolean;
  lue_par:             number | null;
  lue_at:              string | null;
  created_at:          string;
}

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function AlertesSecuriteModal({ isOpen, onClose }: Props) {
  const [loading,    setLoading]    = useState(false);
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [alertes,    setAlertes]    = useState<Alerte[]>([]);
  const [marking,    setMarking]    = useState<number | null>(null);

  const loadAlertes = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await httpClient.get('/securite/alertes');
      setAlertes(response.data.data || []);
    } catch (error) {
      console.error('[Alertes] Erreur:', error);
      setLoadError('Impossible de charger les alertes.');
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadAlertes();
  }, [isOpen, loadAlertes]);

  const handleMarkAsRead = async (id: number) => {
    try {
      setMarking(id);
      await httpClient.patch(`/securite/alertes/${id}`);
      setAlertes(prev => prev.map(a => a.id_alerte === id ? { ...a, lue: true } : a));
      toast.success('Alerte marquée comme traitée');
    } catch (error) {
      console.error('[Alertes] Erreur markAsRead:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setMarking(null);
    }
  };

  const getSeveriteBadge = (severite: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high:     'bg-orange-100 text-orange-700 border-orange-300',
      medium:   'bg-yellow-100 text-yellow-700 border-yellow-300',
      low:      'bg-gray-100 text-gray-700 border-gray-300',
    };
    const labels: Record<string, string> = {
      critical: 'Critique', high: 'Élevée', medium: 'Moyenne', low: 'Faible',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[severite] || styles.low}`}>
        {labels[severite] || severite}
      </span>
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const nonLues = alertes.filter(a => !a.lue);
  const lues    = alertes.filter(a => a.lue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-cyan-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Alertes de Sécurité</h2>
              <p className="text-sm text-cyan-100">
                {nonLues.length > 0
                  ? `${nonLues.length} alerte${nonLues.length > 1 ? 's' : ''} non traitée${nonLues.length > 1 ? 's' : ''}`
                  : 'Aucune alerte en attente'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAlertes} disabled={loading} title="Rafraîchir"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} title="Fermer" aria-label="Fermer"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5">

          {loadError && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-800 font-medium mb-1">Impossible de charger les alertes</p>
              <p className="text-red-600 text-sm mb-4">{loadError}</p>
              <button onClick={loadAlertes}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" />Réessayer
              </button>
            </div>
          )}

          {loading && alertes.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600">Chargement des alertes...</p>
              </div>
            </div>
          )}

          {!loading && !loadError && alertes.length === 0 && (
            <div className="text-center py-20">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune alerte</h3>
              <p className="text-gray-500 text-sm">Rien à signaler pour le moment.</p>
            </div>
          )}

          {!loadError && alertes.length > 0 && (
            <div className="space-y-3">
              {[...nonLues, ...lues].map(alerte => (
                <div key={alerte.id_alerte}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    alerte.lue ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-orange-300 bg-orange-50'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {getSeveriteBadge(alerte.severite)}
                        {alerte.lue && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" />Traitée
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{alerte.titre}</h3>
                      <p className="text-sm text-gray-600 mb-2">{alerte.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatDate(alerte.created_at)}
                        </span>
                        {alerte.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />{alerte.ip_address}
                          </span>
                        )}
                        {alerte.utilisateur_nom && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />{alerte.utilisateur_prenom} {alerte.utilisateur_nom}
                          </span>
                        )}
                      </div>
                    </div>
                    {!alerte.lue && (
                      <button onClick={() => handleMarkAsRead(alerte.id_alerte)}
                        disabled={marking === alerte.id_alerte}
                        className="shrink-0 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                        {marking === alerte.id_alerte
                          ? <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          : <CheckCircle className="w-3.5 h-3.5" />}
                        Marquer traitée
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}