import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import { usePatients }    from '../../../../hooks/usePatients';
import { httpClient }     from '../../../../../infrastructure/http/axios.config';
import type { CreatePatientDTO } from '../../../../../core/entities/Patient';
import { AddPatientHospitaliseModal } from '../../../../components/patients/AddPatientHospitaliseModal';
import { useDossierPath } from '../../../../hooks/useDossierPath';
import { 
  Search, Building2, MapPin, Phone, 
  User, ChevronRight, Plus, Filter, 
  ChevronLeft, Clock,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface LitInfo {
  id_patient:  number;
  numero_lit:  string;
  service_lit: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function PatientsHospitalises() {
  const { navigateToDossier } = useDossierPath();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [sortBy,         setSortBy]         = useState<'recent' | 'ancien'>('recent');
  const [filterSexe,     setFilterSexe]     = useState<'Tous' | 'M' | 'F'>('Tous');
  const [litsMap,        setLitsMap]        = useState<Map<number, LitInfo>>(new Map());

  const ITEMS_PER_PAGE = 5;
  const { patients, loading, refetch } = usePatients('hospitalise');

  // Charger les lits au montage pour obtenir les infos de localisation
  useEffect(() => {
    httpClient.get('/lits').then(res => {
      const lits: Array<{
        numero_lit:   string;
        service_lit:  string;
        patient_actuel?: { id_patient: number };
      }> = res.data ?? [];

      const map = new Map<number, LitInfo>();
      lits.forEach(lit => {
        if (lit.patient_actuel?.id_patient) {
          map.set(lit.patient_actuel.id_patient, {
            id_patient:  lit.patient_actuel.id_patient,
            numero_lit:  lit.numero_lit,
            service_lit: lit.service_lit ?? 'Cardiologie',
          });
        }
      });
      setLitsMap(map);
    }).catch(() => {/* silencieux — pas bloquant */});
  }, []);

  const handleCreatePatient = async (data: CreatePatientDTO & { id_lit?: number }) => {
    try {
      const patientData = { ...data };
      delete (patientData as Record<string, unknown>).id_lit;

      const response = await httpClient.post('/patients', {
        ...patientData,
        statut_patient: 'hospitalise',
      });

      const newPatient = response.data.data;
      if (!newPatient || !newPatient.id_patient) {
        toast.error('Patient créé mais impossible de récupérer son ID');
        await refetch();
        setIsAddModalOpen(false);
        return newPatient;
      }

      await httpClient.post(`/patients/${newPatient.id_patient}/hospitaliser`, {
        motif_hospitalisation:   'Admission initiale',
        service_hospitalisation: 'Médecine Générale',
        id_lit:                  data.id_lit || undefined,
        date_admission:          new Date().toISOString().split('T')[0],
      });

      toast.success(data.id_lit ? 'Patient créé et assigné au lit !' : 'Patient hospitalisé créé !');
      refetch().catch(console.error);
      return newPatient;
    } catch (error) {
      console.error('Erreur création patient:', error);
      throw error;
    }
  };

  const calculateAge = (date: string | Date) => {
    if (!date) return '?';
    return `${new Date().getFullYear() - new Date(date).getFullYear()} ans`;
  };

  const filteredData = useMemo(() => {
    const result = patients.filter(p => {
      const search      = searchTerm.toLowerCase();
      const matchSearch = `${p.nom_patient} ${p.prenom_patient} ${p.num_dossier}`.toLowerCase().includes(search);
      const matchSexe   = filterSexe === 'Tous' || p.sexe_patient === filterSexe;
      return matchSearch && matchSexe;
    });
    return result.sort((a, b) => {
      const da = new Date(a.date_enregistrement).getTime();
      const db = new Date(b.date_enregistrement).getTime();
      return sortBy === 'recent' ? db - da : da - db;
    });
  }, [patients, searchTerm, filterSexe, sortBy]);

  const totalPages      = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const safePage        = Math.min(currentPage, totalPages);
  const currentPatients = filteredData.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const goToPage        = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const handleFilter    = (cb: () => void) => { cb(); setCurrentPage(1); };

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (safePage > 3) pages.push('...');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (loading && patients.length === 0) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4 pb-4 px-0 sm:px-4" style={{ height: 'calc(100vh - 100px)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Hospitalisations</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium italic">Suivi des patients admis au service</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-100 transition-all font-bold active:scale-95 w-full sm:w-auto text-sm">
          <Plus size={18} />Nouvelle Admission
        </button>
      </div>

      {/* Recherche + Filtres */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-full border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full shrink-0">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Rechercher par nom ou numéro..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => handleFilter(() => setSearchTerm(e.target.value))} />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 overflow-x-auto">
          <Filter size={13} className="text-cyan-600 ml-2 shrink-0" />
          <select title="Trier par date" aria-label="Trier par date"
            className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-1.5 shrink-0"
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilter(() => setSortBy(e.target.value as 'recent' | 'ancien'))}>
            <option value="recent">Plus récente</option>
            <option value="ancien">Plus ancienne</option>
          </select>
          <div className="w-px h-4 bg-slate-200 shrink-0" />
          <select title="Filtrer par sexe" aria-label="Filtrer par sexe"
            className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-1.5 shrink-0"
            value={filterSexe}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilter(() => setFilterSexe(e.target.value as 'Tous' | 'M' | 'F'))}>
            <option value="Tous">Tous genres</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </div>
      </div>

      {/* Liste patients */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 sm:space-y-3 pr-0.5">
        {currentPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <User size={40} className="mb-3 opacity-30" />
            <p className="font-bold text-sm">Aucun patient trouvé</p>
          </div>
        ) : (
          currentPatients.map(p => {
            const litInfo = litsMap.get(p.id_patient);
            return (
              <div key={p.id_patient}
                onClick={() => navigateToDossier(p.id_patient, 'hospitalises')}
                className="group relative bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />

                {/* Infos patient */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="shrink-0 w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg sm:text-2xl border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    {p.nom_patient[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <h3 className="text-sm sm:text-lg font-bold text-slate-800 uppercase truncate">
                        {p.nom_patient} {p.prenom_patient}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 shrink-0 uppercase">
                        #{p.num_dossier}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-slate-500">
                      <span className="text-[10px] sm:text-xs font-semibold flex items-center gap-1 shrink-0">
                        <User size={11} className="text-cyan-500" />
                        {p.sexe_patient === 'M' ? 'M' : 'F'} • {calculateAge(p.date_naissance)}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold flex items-center gap-1 min-w-0">
                        <MapPin size={11} className="text-cyan-500 shrink-0" />
                        <span className="truncate">{p.adresse_patient || 'Non renseigné'}</span>
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold flex items-center gap-1 shrink-0">
                        <Phone size={11} className="text-cyan-500" />{p.tel_patient || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Localisation + Admission */}
                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-10 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="flex flex-col text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Localisation</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-cyan-500" />
                        <span className="text-xs font-bold text-slate-700">
                          {litInfo?.service_lit ?? '—'}
                        </span>
                      </div>
                      {litInfo?.numero_lit ? (
                        <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 w-fit">
                          Lit {litInfo.numero_lit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Non assigné</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col text-right lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Admission</p>
                    <div className="flex items-center justify-end lg:justify-start gap-1.5 font-bold text-slate-700 text-xs italic">
                      <Clock size={12} className="text-cyan-500" />
                      {new Date(p.date_enregistrement).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all border border-transparent group-hover:border-cyan-100">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          {filteredData.length === 0
            ? '0 patient'
            : `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredData.length)} / ${filteredData.length}`}
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2">
          <button aria-label="Page précédente" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`e-${idx}`} className="w-5 text-center text-slate-400 text-xs font-bold select-none">…</span>
            ) : (
              <button key={page} onClick={() => goToPage(page as number)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-black transition-all border ${
                  safePage === page
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-100'
                    : 'border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700'
                }`}>{page}</button>
            )
          )}
          <button aria-label="Page suivante" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <AddPatientHospitaliseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePatient}
      />
    </div>
  );
}