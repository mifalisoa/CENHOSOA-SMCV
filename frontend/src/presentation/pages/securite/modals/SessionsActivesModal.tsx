// frontend/src/presentation/pages/securite/modals/SessionsActivesModal.tsx

import { useState, useEffect } from 'react';
import {
  X,
  Users,
  LogOut,
  Globe,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Eye
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Session {
  session_id: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_email: string;
  role: string;
  ip_address: string;
  device_type: string;
  browser: string;
  os: string;
  location_city: string;
  location_country: string;
  created_at: string;
  last_activity: string;
  activity_status: string;
  duration_seconds: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSessionDisconnected?: () => void;
}

export default function SessionsActivesModal({ isOpen, onClose, onSessionDisconnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
      // Auto-refresh toutes les 30 secondes
      const interval = setInterval(loadSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/securite/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('❌ [Sessions] Erreur:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (session: Session) => {
    if (!confirm(`Voulez-vous vraiment déconnecter ${session.utilisateur_prenom} ${session.utilisateur_nom} ?`)) {
      return;
    }

    try {
      await httpClient.delete(`/securite/sessions/${session.session_id}`);
      toast.success('Session déconnectée avec succès');
      loadSessions();
      onSessionDisconnected?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la déconnexion');
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'idle': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'away': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getActivityStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '🟢 En ligne';
      case 'idle': return '🟡 Inactif';
      case 'away': return '⚪ Absent';
      default: return status;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes} min`;
  };

  const formatLastActivity = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `Il y a ${diffHours}h`;
  };

  const stats = {
    total: sessions.length,
    active: sessions.filter(s => s.activity_status === 'active').length,
    idle: sessions.filter(s => s.activity_status === 'idle').length,
    away: sessions.filter(s => s.activity_status === 'away').length
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Sessions Actives</h2>
                <p className="text-sm text-white/80">Gestion des connexions en temps réel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-500">En ligne</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.idle}</p>
                <p className="text-xs text-gray-500">Inactifs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{stats.away}</p>
                <p className="text-xs text-gray-500">Absents</p>
              </div>
            </div>
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
            ) : sessions.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune session active</h3>
                <p className="text-gray-500">Personne n'est connecté pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.device_type);
                  return (
                    <div
                      key={session.session_id}
                      className="bg-white rounded-lg border-2 border-gray-200 hover:border-[#08C5D1] transition-all p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-[#08C5D1] to-[#06B3BF] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {session.utilisateur_prenom?.charAt(0)}{session.utilisateur_nom?.charAt(0)}
                            </span>
                          </div>

                          {/* Infos */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">
                                {session.utilisateur_prenom} {session.utilisateur_nom}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActivityStatusColor(session.activity_status)}`}>
                                {getActivityStatusLabel(session.activity_status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="capitalize">{session.role}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span>{session.ip_address}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <DeviceIcon className="w-4 h-4 text-gray-400" />
                                <span>{session.browser || 'Inconnu'}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{session.location_city || 'Inconnu'}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Connecté depuis {formatDuration(session.duration_seconds)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Dernière activité : {formatLastActivity(session.last_activity)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowDetails(true);
                            }}
                            className="p-2 text-[#08C5D1] hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDisconnect(session)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            title="Déconnecter"
                          >
                            <LogOut className="w-4 h-4" />
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
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
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

      {/* Modal détails */}
      {showDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Détails de la session</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                  <p className="text-sm text-gray-900">
                    {selectedSession.utilisateur_prenom} {selectedSession.utilisateur_nom}
                  </p>
                  <p className="text-xs text-gray-500">{selectedSession.utilisateur_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rôle</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedSession.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse IP</p>
                  <p className="text-sm text-gray-900">{selectedSession.ip_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type d'appareil</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedSession.device_type || 'Inconnu'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Navigateur</p>
                  <p className="text-sm text-gray-900">{selectedSession.browser || 'Inconnu'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Système d'exploitation</p>
                  <p className="text-sm text-gray-900">{selectedSession.os || 'Inconnu'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Localisation</p>
                  <p className="text-sm text-gray-900">
                    {selectedSession.location_city || 'Inconnue'}
                    {selectedSession.location_country && `, ${selectedSession.location_country}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut d'activité</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActivityStatusColor(selectedSession.activity_status)}`}>
                    {getActivityStatusLabel(selectedSession.activity_status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Connecté depuis</p>
                  <p className="text-sm text-gray-900">{formatDuration(selectedSession.duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dernière activité</p>
                  <p className="text-sm text-gray-900">{formatLastActivity(selectedSession.last_activity)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowDetails(false);
                  handleDisconnect(selectedSession);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}