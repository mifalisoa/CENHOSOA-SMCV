// frontend/src/presentation/pages/securite/modals/SessionsActivesModal.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  X, Users, LogOut, Globe, Clock,
  Monitor, Smartphone, Tablet, MapPin, Eye,
  RefreshCw, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Session {
  session_id:         string;
  utilisateur_nom:    string;
  utilisateur_prenom: string;
  utilisateur_email:  string;
  role:               string;
  ip_address:         string;
  device_type:        string;
  browser:            string;
  os:                 string;
  location_city:      string;
  location_country:   string;
  created_at:         string;
  last_activity:      string;
  activity_status:    string;
  duration_seconds:   number;
}

interface Props {
  isOpen:                boolean;
  onClose:               () => void;
  onSessionDisconnected?: () => void;
}

export default function SessionsActivesModal({ isOpen, onClose, onSessionDisconnected }: Props) {
  const [loading,          setLoading]          = useState(false);
  const [loadError,        setLoadError]        = useState<string | null>(null);
  const [sessions,         setSessions]         = useState<Session[]>([]);
  const [selectedSession,  setSelectedSession]  = useState<Session | null>(null);
  const [showDetails,      setShowDetails]      = useState(false);
  // ✅ Dialog de confirmation intégré — remplace confirm() natif
  const [confirmSession,   setConfirmSession]   = useState<Session | null>(null);
  const [disconnecting,    setDisconnecting]    = useState<string | null>(null);

  // ✅ useCallback pour éviter warning exhaustive-deps
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await httpClient.get('/securite/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('❌ [Sessions] Erreur:', error);
      setLoadError('Impossible de charger les sessions actives.');
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
      const interval = setInterval(loadSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, loadSessions]);

  const handleDisconnect = async (session: Session) => {
    try {
      setDisconnecting(session.session_id);
      await httpClient.delete(`/securite/sessions/${session.session_id}`);
      toast.success(`${session.utilisateur_prenom} ${session.utilisateur_nom} déconnecté`);
      setConfirmSession(null);
      setShowDetails(false);
      loadSessions();
      onSessionDisconnected?.();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => ({
    active: 'bg-green-100 text-green-700 border-green-300',
    idle:   'bg-yellow-100 text-yellow-700 border-yellow-300',
    away:   'bg-gray-100 text-gray-700 border-gray-300',
  } as Record<string, string>)[status] || 'bg-gray-100 text-gray-700 border-gray-300';

  const getStatusLabel = (status: string) => ({
    active: '🟢 En ligne',
    idle:   '🟡 Inactif',
    away:   '⚪ Absent',
  } as Record<string, string>)[status] || status;

  const getDeviceIcon = (deviceType: string) => ({
    mobile: Smartphone,
    tablet: Tablet,
  } as Record<string, typeof Monitor>)[deviceType?.toLowerCase()] || Monitor;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  const formatLastActivity = (dateStr: string) => {
    const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffMins < 1)  return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    return `Il y a ${Math.floor(diffMins / 60)}h`;
  };

  const stats = {
    total:  sessions.length,
    active: sessions.filter(s => s.activity_status === 'active').length,
    idle:   sessions.filter(s => s.activity_status === 'idle').length,
    away:   sessions.filter(s => s.activity_status === 'away').length,
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Modal principal ── */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header — cyan uniforme */}
          <div className="bg-cyan-600 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Sessions Actives</h2>
                <p className="text-sm text-cyan-100">
                  {stats.total > 0
                    ? `${stats.total} connexion${stats.total > 1 ? 's' : ''} — rafraîchissement automatique`
                    : 'Gestion des connexions en temps réel'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadSessions} disabled={loading} title="Rafraîchir"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onClose} title="Fermer" aria-label="Fermer"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 shrink-0">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total',    value: stats.total,  color: 'text-gray-900'   },
                { label: 'En ligne', value: stats.active, color: 'text-green-600'  },
                { label: 'Inactifs', value: stats.idle,   color: 'text-yellow-600' },
                { label: 'Absents',  value: stats.away,   color: 'text-gray-500'   },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* Erreur */}
            {loadError && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-800 font-medium mb-1">Impossible de charger les sessions</p>
                <p className="text-red-600 text-sm mb-4">{loadError}</p>
                <button onClick={loadSessions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 mx-auto">
                  <RefreshCw className="w-4 h-4" />Réessayer
                </button>
              </div>
            )}

            {/* Chargement */}
            {loading && sessions.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des sessions...</p>
                </div>
              </div>
            )}

            {/* Aucune session */}
            {!loading && !loadError && sessions.length === 0 && (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune session active</h3>
                <p className="text-gray-500 text-sm">Personne n'est connecté pour le moment.</p>
              </div>
            )}

            {/* Liste sessions */}
            {!loadError && sessions.length > 0 && (
              <div className="space-y-3">
                {sessions.map(session => {
                  const DeviceIcon = getDeviceIcon(session.device_type);
                  const isDisconnecting = disconnecting === session.session_id;
                  return (
                    <div key={session.session_id}
                      className={`bg-white rounded-xl border-2 transition-all p-4 ${
                        session.activity_status === 'active'
                          ? 'border-green-200 hover:border-green-300'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-11 h-11 bg-cyan-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">
                              {session.utilisateur_prenom?.charAt(0)}{session.utilisateur_nom?.charAt(0)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 text-sm">
                                {session.utilisateur_prenom} {session.utilisateur_nom}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(session.activity_status)}`}>
                                {getStatusLabel(session.activity_status)}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                                {session.role}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />{session.ip_address || '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <DeviceIcon className="w-3 h-3" />{session.browser || 'Inconnu'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{session.location_city || 'Inconnu'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{formatLastActivity(session.last_activity)}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-1.5">
                              Connecté depuis {formatDuration(session.duration_seconds)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => { setSelectedSession(session); setShowDetails(true); }}
                            title="Voir les détails de la session"
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmSession(session)}
                            disabled={isDisconnecting}
                            title="Déconnecter cet utilisateur"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50">
                            {isDisconnecting
                              ? <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <LogOut className="w-3.5 h-3.5" />
                            }
                            Déconnecter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-between items-center shrink-0">
            <p className="text-sm text-gray-500">
              {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
              {loading && sessions.length > 0 && <span className="ml-2 text-xs text-cyan-600">• Actualisation...</span>}
            </p>
            <button onClick={onClose}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* ── Dialog confirmation déconnexion — remplace confirm() natif ── */}
      {confirmSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Déconnecter cet utilisateur ?</h3>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-semibold">{confirmSession.utilisateur_prenom} {confirmSession.utilisateur_nom}</span>
              </p>
              <p className="text-gray-500 text-xs mb-6">
                {confirmSession.utilisateur_email} · {confirmSession.role} · {confirmSession.ip_address}
              </p>
              <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                ⚠️ L'utilisateur sera déconnecté immédiatement et devra se reconnecter.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmSession(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button onClick={() => handleDisconnect(confirmSession)}
                  disabled={!!disconnecting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {disconnecting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Déconnexion...</>
                    : <><LogOut className="w-4 h-4" />Déconnecter</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal détails session ── */}
      {showDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold">Détails de la session</h2>
              <button onClick={() => setShowDetails(false)} title="Fermer" aria-label="Fermer"
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Utilisateur',           value: `${selectedSession.utilisateur_prenom} ${selectedSession.utilisateur_nom}` },
                  { label: 'Email',                  value: selectedSession.utilisateur_email },
                  { label: 'Rôle',                   value: selectedSession.role },
                  { label: 'Adresse IP',             value: selectedSession.ip_address },
                  { label: 'Type d\'appareil',       value: selectedSession.device_type || 'Inconnu' },
                  { label: 'Navigateur',             value: selectedSession.browser || 'Inconnu' },
                  { label: 'Système d\'exploitation', value: selectedSession.os || 'Inconnu' },
                  { label: 'Localisation',           value: [selectedSession.location_city, selectedSession.location_country].filter(Boolean).join(', ') || 'Inconnue' },
                  { label: 'Connecté depuis',        value: formatDuration(selectedSession.duration_seconds) },
                  { label: 'Dernière activité',      value: formatLastActivity(selectedSession.last_activity) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedSession.activity_status)}`}>
                    {getStatusLabel(selectedSession.activity_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowDetails(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                Fermer
              </button>
              <button onClick={() => { setShowDetails(false); setConfirmSession(selectedSession); }}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm flex items-center gap-2">
                <LogOut className="w-4 h-4" />Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}