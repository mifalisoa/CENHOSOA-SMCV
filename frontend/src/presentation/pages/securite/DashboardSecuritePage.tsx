// frontend/src/presentation/pages/securite/DashboardSecuritePage.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, ArrowLeft, RefreshCw, Users, AlertTriangle,
  Activity, Lock, Info, Settings, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

import HistoriqueLogsModal  from './modals/HistoriqueLogsModal';
import SessionsActivesModal from './modals/SessionsActivesModal';
import ParametresSecuriteModal from './modals/ParametresSecuriteModal';

interface SessionActive {
  session_id:         string;
  utilisateur_nom:    string;
  utilisateur_prenom: string;
  role:               string;
  ip_address:         string;
  last_activity:      string;
  created_at:         string;
  duration_seconds:   number;
}

interface Stats {
  sessions_actives:        number;
  tentatives_echouees_24h: number;
  actions_aujourdhui:      number;
  alertes_non_lues:        number;
}

type ModalType = null | 'logs' | 'sessions' | 'parametres';

export default function DashboardSecuritePage() {
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [stats,        setStats]        = useState<Stats>({
    sessions_actives: 0, tentatives_echouees_24h: 0,
    actions_aujourdhui: 0, alertes_non_lues: 0,
  });
  const [sessions,     setSessions]     = useState<SessionActive[]>([]);
  const [activeModal,  setActiveModal]  = useState<ModalType>(null);

  // ✅ useCallback — plus de warning exhaustive-deps
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const [statsRes, sessionsRes] = await Promise.all([
        httpClient.get('/securite/stats'),
        httpClient.get('/securite/sessions'),
      ]);

      setStats(statsRes.data.data || statsRes.data);
      setSessions(sessionsRes.data.data || []);
    } catch (error) {
      console.error('❌ [Sécurité] Erreur chargement:', error);
      setLoadError('Impossible de charger les données de sécurité.');
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const getActivityStatus = (lastActivity: string) => {
    const diffMins = Math.floor((Date.now() - new Date(lastActivity).getTime()) / 60000);
    if (diffMins < 5)  return { label: '🟢 En ligne', color: 'bg-green-100 text-green-700' };
    if (diffMins < 30) return { label: '🟡 Inactif',  color: 'bg-yellow-100 text-yellow-700' };
    return { label: '⚪ Absent', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header — cyan uniforme ── */}
      <div className="bg-cyan-600 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-cyan-100 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Sécurité</h1>
                  <p className="text-cyan-100 text-sm mt-0.5">Surveillance et protection — CENHOSOA</p>
                </div>
              </div>
            </div>

            <button onClick={loadDashboard} disabled={loading}
              className="flex items-center gap-2 bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-50 transition-colors disabled:opacity-60">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Info box */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-100 shrink-0 mt-0.5" />
              <p className="text-sm text-cyan-100">
                <span className="font-semibold text-white">Module Sécurité</span> — Cliquez sur une carte ou un bouton pour accéder aux détails, gérer les connexions ou configurer les paramètres.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* ── État chargement ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
            </div>
          </div>
        )}

        {/* ── État erreur global ── */}
        {loadError && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto mt-10">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mb-6">{loadError}</p>
            <button onClick={loadDashboard}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
              <RefreshCw className="w-4 h-4" />Réessayer
            </button>
          </div>
        )}

        {/* ── Contenu principal ── */}
        {!loading && !loadError && (
          <div className="space-y-6">

            {/* ── KPI Cards — cliquables ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Sessions actives → ouvre modal sessions */}
              <button onClick={() => setActiveModal('sessions')} className="text-left">
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-cyan-400 hover:shadow-md transition-all h-full">
                  <div className="p-2 bg-green-100 rounded-lg w-fit mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Utilisateurs connectés</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.sessions_actives}</p>
                  <p className="text-xs text-cyan-600 font-medium">→ Voir les sessions</p>
                </div>
              </button>

              {/* Tentatives échouées → ouvre modal logs */}
              <button onClick={() => setActiveModal('logs')} className="text-left">
                <div className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all h-full ${
                  stats.tentatives_echouees_24h > 5 ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-cyan-400'
                }`}>
                  <div className={`p-2 rounded-lg w-fit mb-3 ${
                    stats.tentatives_echouees_24h > 5 ? 'bg-red-200' : 'bg-orange-100'
                  }`}>
                    <Lock className={`w-6 h-6 ${stats.tentatives_echouees_24h > 5 ? 'text-red-600' : 'text-orange-600'}`} />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Tentatives échouées (24h)</p>
                  <p className={`text-3xl font-bold mb-2 ${stats.tentatives_echouees_24h > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {stats.tentatives_echouees_24h}
                  </p>
                  <p className={`text-xs font-medium ${stats.tentatives_echouees_24h > 5 ? 'text-red-600' : 'text-cyan-600'}`}>
                    {stats.tentatives_echouees_24h > 5 ? '⚠️ Voir les logs' : '→ Voir les logs'}
                  </p>
                </div>
              </button>

              {/* Actions aujourd'hui → ouvre modal logs */}
              <button onClick={() => setActiveModal('logs')} className="text-left">
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-cyan-400 hover:shadow-md transition-all h-full">
                  <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Actions aujourd'hui</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.actions_aujourdhui}</p>
                  <p className="text-xs text-cyan-600 font-medium">→ Voir l'historique</p>
                </div>
              </button>

              {/* Alertes → ouvre modal logs */}
              <button onClick={() => setActiveModal('logs')} className="text-left">
                <div className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all h-full ${
                  stats.alertes_non_lues > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-cyan-400'
                }`}>
                  <div className={`p-2 rounded-lg w-fit mb-3 ${stats.alertes_non_lues > 0 ? 'bg-red-200' : 'bg-gray-100'}`}>
                    <AlertTriangle className={`w-6 h-6 ${stats.alertes_non_lues > 0 ? 'text-red-600' : 'text-gray-500'}`} />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Alertes de sécurité</p>
                  <p className={`text-3xl font-bold mb-2 ${stats.alertes_non_lues > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {stats.alertes_non_lues}
                  </p>
                  <p className={`text-xs font-medium ${stats.alertes_non_lues > 0 ? 'text-red-600' : 'text-cyan-600'}`}>
                    {stats.alertes_non_lues > 0 ? '🔴 Action requise' : '✅ Aucun problème'}
                  </p>
                </div>
              </button>
            </div>

            {/* ── Boutons d'accès rapide ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  modal:       'logs' as ModalType,
                  icon:        Activity,
                  title:       'Historique des Actions',
                  description: 'Voir qui a fait quoi et quand dans l\'application',
                },
                {
                  modal:       'sessions' as ModalType,
                  icon:        Users,
                  title:       'Gérer les Sessions',
                  description: 'Voir et déconnecter les utilisateurs connectés',
                },
                {
                  modal:       'parametres' as ModalType,
                  icon:        Settings,
                  title:       'Paramètres de Sécurité',
                  description: 'Configurer les règles et seuils de sécurité',
                },
              ].map(({ modal, icon: Icon, title, description }) => (
                <button key={modal} onClick={() => setActiveModal(modal)}
                  className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-cyan-400 hover:shadow-md transition-all text-left group">
                  <Icon className="w-9 h-9 text-cyan-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </button>
              ))}
            </div>

            {/* ── Aperçu sessions actives ── */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  Connexions en cours
                  <span className="ml-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                    {sessions.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 3).map(session => (
                    <div key={session.session_id}
                      className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* ✅ Avatar cyan uni */}
                        <div className="w-9 h-9 bg-cyan-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-xs">
                            {session.utilisateur_prenom?.charAt(0)}{session.utilisateur_nom?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {session.utilisateur_prenom} {session.utilisateur_nom}
                          </p>
                          <p className="text-xs text-gray-400">{session.ip_address} · {session.role}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActivityStatus(session.last_activity).color}`}>
                        {getActivityStatus(session.last_activity).label}
                      </span>
                    </div>
                  ))}
                </div>
                {sessions.length > 3 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    +{sessions.length - 3} autre{sessions.length - 3 > 1 ? 's' : ''} session{sessions.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
                <button onClick={() => setActiveModal('sessions')}
                  className="w-full mt-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg font-medium transition-colors text-sm">
                  Gérer toutes les sessions →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <HistoriqueLogsModal
        isOpen={activeModal === 'logs'}
        onClose={() => setActiveModal(null)}
      />
      <SessionsActivesModal
        isOpen={activeModal === 'sessions'}
        onClose={() => setActiveModal(null)}
        onSessionDisconnected={loadDashboard}
      />
      <ParametresSecuriteModal
        isOpen={activeModal === 'parametres'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}