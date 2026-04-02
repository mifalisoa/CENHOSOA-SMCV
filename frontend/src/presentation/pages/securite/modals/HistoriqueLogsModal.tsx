// frontend/src/presentation/pages/securite/modals/HistoriqueLogsModal.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  X, Activity, Calendar, User, Tag, Globe,
  CheckCircle, XCircle, AlertCircle, Eye, Filter,
  RefreshCw, Download, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { httpClient } from '../../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Log {
  id_log:             number;
  utilisateur_nom:    string;
  utilisateur_prenom: string;
  utilisateur_email:  string;
  role:               string;
  action:             string;
  module:             string;
  ip_address:         string;
  statut:             string;
  created_at:         string;
  details:            Record<string, unknown> | null;
  error_message?:     string;
}

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const PAGE_SIZE = 50;

export default function HistoriqueLogsModal({ isOpen, onClose }: Props) {
  const [loading,       setLoading]       = useState(false);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [logs,          setLogs]          = useState<Log[]>([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [selectedLog,   setSelectedLog]   = useState<Log | null>(null);
  const [showDetails,   setShowDetails]   = useState(false);
  const [filterModule,  setFilterModule]  = useState('all');
  const [filterAction,  setFilterAction]  = useState('all');
  const [filterStatut,  setFilterStatut]  = useState('all');
  const [filterPeriode, setFilterPeriode] = useState('all');

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Chargement ────────────────────────────────────────────────────────────
  const loadLogs = useCallback(async (p = page) => {
    try {
      setLoading(true);
      setLoadError(null);

      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String((p - 1) * PAGE_SIZE),
      });
      if (filterModule  !== 'all') params.append('module',  filterModule);
      if (filterAction  !== 'all') params.append('action',  filterAction);
      if (filterStatut  !== 'all') params.append('statut',  filterStatut);
      if (filterPeriode !== 'all') params.append('periode',  filterPeriode);

      const response = await httpClient.get(`/securite/logs?${params}`);
      setLogs(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('❌ [Logs] Erreur:', error);
      setLoadError('Impossible de charger les logs. Vérifiez votre connexion.');
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  }, [filterModule, filterAction, filterStatut, filterPeriode, page]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      loadLogs(1);
    }
  }, [isOpen, filterModule, filterAction, filterStatut, filterPeriode]); // eslint-disable-line

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadLogs(newPage);
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (logs.length === 0) { toast.error('Aucun log à exporter'); return; }

    const headers = ['Date/Heure', 'Utilisateur', 'Email', 'Rôle', 'Action', 'Module', 'IP', 'Statut'];
    const rows = logs.map(l => [
      formatDate(l.created_at),
      `${l.utilisateur_prenom} ${l.utilisateur_nom}`,
      l.utilisateur_email || '',
      l.role || '',
      getActionLabel(l.action),
      getModuleLabel(l.module),
      l.ip_address || '',
      l.statut,
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs_securite_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    toast.success(`${logs.length} logs exportés`);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-700 border-green-300',
      update: 'bg-blue-100 text-blue-700 border-blue-300',
      delete: 'bg-red-100 text-red-700 border-red-300',
      login:  'bg-purple-100 text-purple-700 border-purple-300',
      logout: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[action] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getActionLabel = (action: string) => ({
    create: 'Création', update: 'Modification', delete: 'Suppression',
    login: 'Connexion', logout: 'Déconnexion', read: 'Consultation',
  } as Record<string, string>)[action] || action;

  const getModuleLabel = (module: string) => ({
    patients: 'Patients', rdv: 'Rendez-vous', admissions: 'Admissions',
    prescriptions: 'Prescriptions', traitements: 'Traitements',
    observations: 'Observations', bilans: 'Bilans', documents: 'Documents',
    soins_medicaux: 'Soins médicaux', soins_infirmiers: 'Soins infirmiers',
    comptes_rendus: 'Comptes rendus', notifications: 'Notifications',
    lits: 'Lits', utilisateurs: 'Utilisateurs',
    auth: 'Authentification', security: 'Sécurité',
  } as Record<string, string>)[module] || module;

  const getStatutBadge = (statut: string) => {
    if (statut === 'success') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />Succès
      </span>
    );
    if (statut === 'error') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />Erreur
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <AlertCircle className="w-3 h-3" />Bloqué
      </span>
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

          {/* ── Header — cyan uniforme ── */}
          <div className="bg-cyan-600 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Historique des Actions</h2>
                <p className="text-sm text-cyan-100">
                  {total > 0 ? `${total} action${total > 1 ? 's' : ''} enregistrée${total > 1 ? 's' : ''}` : 'Traçabilité complète'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Export CSV */}
              <button onClick={exportCSV} title="Exporter en CSV"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                CSV
              </button>
              {/* Rafraîchir */}
              <button onClick={() => loadLogs(page)} title="Rafraîchir" disabled={loading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onClose} title="Fermer" aria-label="Fermer"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* ── Filtres ── */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtres</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select title="Filtrer par période"
                value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>

              <select title="Filtrer par module"
                value={filterModule} onChange={e => setFilterModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="all">Tous les modules</option>
                <option value="patients">Patients</option>
                <option value="rdv">Rendez-vous</option>
                <option value="admissions">Admissions</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="traitements">Traitements</option>
                <option value="observations">Observations</option>
                <option value="bilans">Bilans</option>
                <option value="soins_medicaux">Soins médicaux</option>
                <option value="soins_infirmiers">Soins infirmiers</option>
                <option value="comptes_rendus">Comptes rendus</option>
                <option value="documents">Documents</option>
                <option value="lits">Lits</option>
                <option value="utilisateurs">Utilisateurs</option>
                <option value="auth">Authentification</option>
              </select>

              <select title="Filtrer par action"
                value={filterAction} onChange={e => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="all">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="login">Connexion</option>
                <option value="logout">Déconnexion</option>
              </select>

              <select title="Filtrer par statut"
                value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="all">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="error">Erreur</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
          </div>

          {/* ── Contenu ── */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* État erreur */}
            {loadError && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-800 font-medium mb-1">Impossible de charger les logs</p>
                <p className="text-red-600 text-sm mb-4">{loadError}</p>
                <button onClick={() => loadLogs(page)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              </div>
            )}

            {/* Chargement */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des logs...</p>
                </div>
              </div>
            )}

            {/* Aucun résultat */}
            {!loading && !loadError && logs.length === 0 && (
              <div className="text-center py-20">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun log trouvé</h3>
                <p className="text-gray-500 text-sm">Modifiez vos critères de recherche ou attendez que des actions soient enregistrées.</p>
              </div>
            )}

            {/* Tableau */}
            {!loading && !loadError && logs.length > 0 && (
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id_log} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.utilisateur_prenom} {log.utilisateur_nom}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" />
                            {getModuleLabel(log.module)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <Globe className="w-3 h-3 text-gray-400" />
                            {log.ip_address || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatutBadge(log.statut)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelectedLog(log); setShowDetails(true); }}
                            title="Voir les détails"
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Footer avec pagination ── */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-between items-center shrink-0">
            <p className="text-sm text-gray-600">
              {total > 0
                ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} sur ${total} log${total > 1 ? 's' : ''}`
                : '0 log'
              }
            </p>
            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <>
                  <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1 || loading}
                    aria-label="Page précédente" 
                    title="Page précédente"
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {page} / {totalPages}
                  </span>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages || loading}
                    aria-label="Page suivante" 
                    title="Page suivante"
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={onClose}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm ml-2">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal détails ── */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold">Détails de l'action</h2>
              <button onClick={() => setShowDetails(false)} title="Fermer" aria-label="Fermer"
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Horodatage</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Utilisateur</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.utilisateur_prenom} {selectedLog.utilisateur_nom}</p>
                  <p className="text-xs text-gray-500">{selectedLog.utilisateur_email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Rôle</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedLog.role}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Action</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                    {getActionLabel(selectedLog.action)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Module</p>
                  <p className="text-sm text-gray-900">{getModuleLabel(selectedLog.module)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Adresse IP</p>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.ip_address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Statut</p>
                  {getStatutBadge(selectedLog.statut)}
                </div>
              </div>

              {selectedLog.details && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Détails techniques</p>
                  <pre className="bg-gray-50 p-4 rounded-xl text-xs overflow-x-auto border border-gray-200 font-mono">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.error_message && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase mb-1">Message d'erreur</p>
                  <p className="text-sm text-red-800">{selectedLog.error_message}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end shrink-0">
              <button onClick={() => setShowDetails(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}