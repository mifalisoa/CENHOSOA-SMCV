// frontend/src/presentation/pages/securite/modals/HistoriqueLogsModal.tsx

import { useState, useEffect } from 'react';
import { X, Activity, Calendar, User, Tag, Globe, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Log {
  id_log: number;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_email: string;
  role: string;
  action: string;
  module: string;
  ip_address: string;
  statut: string;
  created_at: string;
  details: any;
  error_message?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoriqueLogsModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, filterModule, filterAction, filterStatut]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (filterModule !== 'all') params.append('module', filterModule);
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterStatut !== 'all') params.append('statut', filterStatut);

      const response = await httpClient.get(`/securite/logs?${params}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('❌ [Logs] Erreur:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-700 border-green-300',
      update: 'bg-blue-100 text-blue-700 border-blue-300',
      delete: 'bg-red-100 text-red-700 border-red-300',
      login: 'bg-purple-100 text-purple-700 border-purple-300',
      logout: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[action] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Création', update: 'Modification', delete: 'Suppression',
      login: 'Connexion', logout: 'Déconnexion', read: 'Consultation'
    };
    return labels[action] || action;
  };

  const getModuleLabel = (module: string) => {
    const labels: Record<string, string> = {
      patients: 'Patients', rdv: 'Rendez-vous', admissions: 'Admissions',
      prescriptions: 'Prescriptions', auth: 'Authentification', lits: 'Lits',
      utilisateurs: 'Utilisateurs', security: 'Sécurité'
    };
    return labels[module] || module;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Historique des Actions</h2>
                <p className="text-sm text-white/80">Traçabilité complète des opérations</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtres</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#08C5D1] outline-none">
                <option value="all">Tous les modules</option>
                <option value="patients">Patients</option>
                <option value="rdv">Rendez-vous</option>
                <option value="admissions">Admissions</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="lits">Lits</option>
                <option value="utilisateurs">Utilisateurs</option>
                <option value="auth">Authentification</option>
              </select>

              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#08C5D1] outline-none">
                <option value="all">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="login">Connexion</option>
                <option value="logout">Déconnexion</option>
              </select>

              <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#08C5D1] outline-none">
                <option value="all">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="error">Erreur</option>
                <option value="blocked">Bloqué</option>
              </select>
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
            ) : logs.length === 0 ? (
              <div className="text-center py-20">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun log trouvé</h3>
                <p className="text-gray-500">Modifiez vos critères de recherche</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date/Heure</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Module</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id_log} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.utilisateur_prenom} {log.utilisateur_nom}
                              </p>
                              <p className="text-xs text-gray-500">{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <Tag className="w-3 h-3" />
                            {getModuleLabel(log.module)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <Globe className="w-3 h-3" />
                            {log.ip_address || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.statut === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : log.statut === 'error' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelectedLog(log); setShowDetails(true); }}
                            className="text-[#08C5D1] hover:underline flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4" />
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">{logs.length} log{logs.length > 1 ? 's' : ''} affiché{logs.length > 1 ? 's' : ''}</p>
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal détails */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-4">
              <h2 className="text-xl font-bold">Détails de l'action</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Horodatage</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                  <p className="text-sm text-gray-900">{selectedLog.utilisateur_prenom} {selectedLog.utilisateur_nom}</p>
                  <p className="text-xs text-gray-500">{selectedLog.utilisateur_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rôle</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedLog.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Action</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                    {getActionLabel(selectedLog.action)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Module</p>
                  <p className="text-sm text-gray-900">{getModuleLabel(selectedLog.module)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse IP</p>
                  <p className="text-sm text-gray-900">{selectedLog.ip_address || '-'}</p>
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Détails (JSON)</p>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border border-gray-200">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.error_message && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-1">Message d'erreur</p>
                  <p className="text-sm text-red-700">{selectedLog.error_message}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button onClick={() => setShowDetails(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}