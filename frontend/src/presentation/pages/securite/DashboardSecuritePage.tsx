// frontend/src/presentation/pages/securite/DashboardSecuritePage.tsx

import { useState, useEffect } from 'react';
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  Users,
  AlertTriangle,
  Activity,
  Lock,
  Info,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

// Import des modals
import HistoriqueLogsModal from './modals/HistoriqueLogsModal';
import SessionsActivesModal from './modals/SessionsActivesModal';

import ParametresSecuriteModal from './modals/ParametresSecuriteModal';

interface SessionActive {
  session_id: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  role: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
  duration_seconds: number;
}

interface Stats {
  sessions_actives: number;
  tentatives_echouees_24h: number;
  actions_aujourdhui: number;
  alertes_non_lues: number;
}

type ModalType = null | 'logs' | 'sessions' | 'parametres';

export default function DashboardSecuritePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    sessions_actives: 0,
    tentatives_echouees_24h: 0,
    actions_aujourdhui: 0,
    alertes_non_lues: 0
  });
  const [sessions, setSessions] = useState<SessionActive[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Sécurité] Chargement dashboard...');

      const [statsRes, sessionsRes] = await Promise.all([
        httpClient.get('/securite/stats'),
        httpClient.get('/securite/sessions')
      ]);

      setStats(statsRes.data.data || statsRes.data);
      setSessions(sessionsRes.data.data || sessionsRes.data || []);

      console.log('✅ [Sécurité] Dashboard chargé');
    } catch (error) {
      console.error('❌ [Sécurité] Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };


  const getActivityStatus = (lastActivity: string) => {
    const diffMins = Math.floor((Date.now() - new Date(lastActivity).getTime()) / 60000);
    if (diffMins < 5) return { label: '🟢 En ligne', color: 'bg-green-100 text-green-700' };
    if (diffMins < 30) return { label: '🟡 Inactif', color: 'bg-yellow-100 text-yellow-700' };
    return { label: '⚪ Absent', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Sécurité</h1>
                  <p className="text-white/90 mt-1">Surveillance et protection - CENHOSOA</p>
                </div>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-[#08C5D1] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Info box */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/90">
                <p className="font-medium mb-1">🔐 Module Sécurité</p>
                <p>
                  Surveillez l'activité de votre application. Cliquez sur les boutons ci-dessous pour voir les détails, 
                  gérer les connexions ou configurer les paramètres de sécurité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#08C5D1] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Chargement...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-[#08C5D1] transition-all">
                <div className="p-2 bg-green-100 rounded-lg w-fit mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Utilisateurs connectés</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.sessions_actives}</p>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Personnes utilisant l'application en ce moment
                </p>
              </div>

              <div className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                stats.tentatives_echouees_24h > 5 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-[#08C5D1]'
              }`}>
                <div className={`p-2 rounded-lg w-fit mb-2 ${
                  stats.tentatives_echouees_24h > 5 ? 'bg-red-200' : 'bg-orange-100'
                }`}>
                  <Lock className={`w-6 h-6 ${
                    stats.tentatives_echouees_24h > 5 ? 'text-red-600' : 'text-orange-600'
                  }`} />
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Tentatives échouées (24h)</h3>
                <p className={`text-3xl font-bold ${
                  stats.tentatives_echouees_24h > 5 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.tentatives_echouees_24h}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.tentatives_echouees_24h > 5 
                    ? '⚠️ Nombreuses tentatives ratées' 
                    : '✅ Nombre normal'
                  }
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-[#08C5D1] transition-all">
                <div className="p-2 bg-blue-100 rounded-lg w-fit mb-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Actions aujourd'hui</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.actions_aujourdhui}</p>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Créations, modifications effectuées
                </p>
              </div>

              <div className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                stats.alertes_non_lues > 0 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-[#08C5D1]'
              }`}>
                <div className={`p-2 rounded-lg w-fit mb-2 ${
                  stats.alertes_non_lues > 0 ? 'bg-red-200' : 'bg-gray-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    stats.alertes_non_lues > 0 ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Alertes de sécurité</h3>
                <p className={`text-3xl font-bold ${
                  stats.alertes_non_lues > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.alertes_non_lues}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.alertes_non_lues > 0 ? '🔴 Actions nécessaires' : '✅ Aucun problème'}
                </p>
              </div>
            </div>

            {/* Boutons d'actions - Ouvrent les modals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveModal('logs')}
                className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-[#08C5D1] hover:shadow-lg transition-all text-left group"
              >
                <Activity className="w-10 h-10 text-[#08C5D1] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">Historique des Actions</h3>
                <p className="text-sm text-gray-600">
                  Voir qui a fait quoi et quand dans l'application
                </p>
              </button>

              <button
                onClick={() => setActiveModal('sessions')}
                className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-[#08C5D1] hover:shadow-lg transition-all text-left group"
              >
                <Users className="w-10 h-10 text-[#08C5D1] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">Gérer les Sessions</h3>
                <p className="text-sm text-gray-600">
                  Voir et déconnecter les utilisateurs connectés
                </p>
              </button>

              <button
                onClick={() => setActiveModal('parametres')}
                className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-[#08C5D1] hover:shadow-lg transition-all text-left group"
              >
                <Settings className="w-10 h-10 text-[#08C5D1] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">Paramètres de Sécurité</h3>
                <p className="text-sm text-gray-600">
                  Configurer les règles de sécurité (explications simples)
                </p>
              </button>
            </div>

            {/* Aperçu sessions actives */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#08C5D1]" />
                  Connexions récentes ({sessions.length})
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 3).map(session => (
                    <div key={session.session_id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#08C5D1] to-[#06B3BF] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {session.utilisateur_prenom?.charAt(0)}{session.utilisateur_nom?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.utilisateur_prenom} {session.utilisateur_nom}</p>
                          <p className="text-xs text-gray-500">{session.ip_address}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActivityStatus(session.last_activity).color}`}>
                        {getActivityStatus(session.last_activity).label}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveModal('sessions')}
                  className="w-full mt-4 py-2 text-[#08C5D1] hover:bg-cyan-50 rounded-lg font-medium transition-colors"
                >
                  Voir toutes les sessions →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
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