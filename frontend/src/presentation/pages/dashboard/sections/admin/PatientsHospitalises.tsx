import { useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../../hooks/usePatients';
import { httpClient } from '../../../../../infrastructure/http/axios.config';

import type { CreatePatientDTO } from '../../../../../core/entities/Patient';
import { AddPatientHospitaliseModal } from '../../../../components/patients/AddPatientHospitaliseModal';
import { 
  Search, Building2, MapPin, Phone, 
  User, ChevronRight, Plus, Filter, 
  ChevronLeft, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientsHospitalises() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [sortBy, setSortBy] = useState<'recent' | 'ancien'>('recent');
  const [filterSexe, setFilterSexe] = useState<'Tous' | 'M' | 'F'>('Tous');

  const { patients, loading, refetch } = usePatients('hospitalise');

  // ── MODIFICATION ──────────────────────────────────────────────────────────
  // Avant : void à la fin, setIsAddModalOpen(false) dans le try
  // Après : return newPatient à la fin pour que le modal récupère id_patient
  //         NE PAS appeler setIsAddModalOpen(false) ici — le modal le fait lui-même
  //         après l'étape de confirmation / RDV
  const handleCreatePatient = async (data: CreatePatientDTO & { id_lit?: number }) => {
    try {
      const patientData = { ...data };
      delete (patientData as Record<string, unknown>).id_lit;

      const response = await httpClient.post('/patients', {
        ...patientData,
        statut_patient: 'hospitalise'
      });

      const newPatient = response.data.data;

      if (!newPatient || !newPatient.id_patient) {
        toast.error('Patient créé mais impossible de récupérer son ID');
        await refetch();
        setIsAddModalOpen(false);
        return newPatient;
      }

      await httpClient.post(`/patients/${newPatient.id_patient}/hospitaliser`, {
        motif_hospitalisation: 'Admission initiale',
        service_hospitalisation: 'Médecine Générale',
        id_lit: data.id_lit || undefined,
        date_admission: new Date().toISOString().split('T')[0]
      });

      toast.success(data.id_lit ? 'Patient créé et assigné au lit avec succès !' : 'Patient hospitalisé créé avec succès !');
      refetch().catch(console.error);

      // ← NE PAS fermer le modal ici — le modal passe à l'étape "confirmation + RDV"
      return newPatient; // ← id_patient transmis au modal pour patientPreselection
    } catch (error) {
      console.error('Erreur création patient:', error);
      throw error;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const calculateAge = (date: string | Date) => {
    if (!date) return '?';
    const birthDate = new Date(date);
    return `${new Date().getFullYear() - birthDate.getFullYear()} ans`;
  };

  const filteredData = useMemo(() => {
    const result = patients.filter((p) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = `${p.nom_patient} ${p.prenom_patient} ${p.num_dossier}`.toLowerCase().includes(search);
      const matchesSexe = filterSexe === 'Tous' || p.sexe_patient === filterSexe;
      return matchesSearch && matchesSexe;
    });

    return result.sort((a, b) => {
      const da = new Date(a.date_enregistrement).getTime();
      const db = new Date(b.date_enregistrement).getTime();
      return sortBy === 'recent' ? db - da : da - db;
    });
  }, [patients, searchTerm, filterSexe, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const currentPatients = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handleFilterChange = (cb: () => void) => { cb(); setCurrentPage(1); };

  if (loading && patients.length === 0) return (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

  return (
    <div className="w-full flex flex-col gap-4 pb-4 px-0 sm:px-4" style={{ height: 'calc(100vh - 100px)' }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Hospitalisations</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium italic">Suivi des patients admis au service</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-100 transition-all font-bold active:scale-95 w-full md:w-auto text-sm"
        >
          <Plus size={18} /> Nouvelle Admission
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center w-full shrink-0">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro de dossier..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 w-full md:w-auto overflow-x-auto">
          <Filter size={14} className="text-cyan-600 ml-3 shrink-0" />
          <select
            title="Trier par date"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange(() => setSortBy(e.target.value as 'recent' | 'ancien'))}
          >
            <option value="recent">Admission : Récente</option>
            <option value="ancien">Admission : Ancienne</option>
          </select>
          <div className="w-px h-4 bg-slate-200" />
          <select
            title="Filtrer par sexe"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={filterSexe}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange(() => setFilterSexe(e.target.value as 'Tous' | 'M' | 'F'))}
          >
            <option value="Tous">Tous Genres</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-0.5">
        {currentPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <User size={40} className="mb-3 opacity-30" />
            <p className="font-bold text-sm">Aucun patient trouvé</p>
          </div>
        ) : (
          currentPatients.map((p) => (
            <div
              key={p.id_patient}
              onClick={() => navigate(`/patients/${p.id_patient}/dossier`)}
              className="group relative bg-white border border-slate-100 p-4 md:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />

              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg md:text-2xl border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  {p.nom_patient[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 uppercase truncate">
                      {p.nom_patient} {p.prenom_patient}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 shrink-0 uppercase">
                      #{p.num_dossier}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                    <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                      <User size={12} className="text-cyan-500" /> {p.sexe_patient === 'M' ? 'Masculin' : 'Féminin'} • {calculateAge(p.date_naissance)}
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1">
                      <MapPin size={12} className="text-cyan-500" />
                      <span className="truncate max-w-[150px] md:max-w-none">{p.adresse_patient || 'Adresse non spécifiée'}</span>
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                      <Phone size={12} className="text-cyan-500" /> {p.tel_patient || '-- -- --'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-4 md:gap-10 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="flex flex-col text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-cyan-500" />
                      <span className="text-xs md:text-sm font-bold text-slate-700">Médecine Générale</span>
                    </div>
                    <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 w-fit">Lit : 104-A</span>
                  </div>
                </div>

                <div className="flex flex-col text-right lg:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admission</p>
                  <div className="flex items-center justify-end lg:justify-start gap-2 font-bold text-slate-700 text-xs md:text-sm italic">
                    <Clock size={14} className="text-cyan-500" />
                    {new Date(p.date_enregistrement).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all border border-transparent group-hover:border-cyan-100">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          {filteredData.length === 0
            ? '0 patient'
            : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} sur ${filteredData.length} patient${filteredData.length > 1 ? 's' : ''}`}
        </p>

        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          <button title="Page précédente" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-6 text-center text-slate-400 text-xs font-bold select-none">…</span>
            ) : (
              <button key={page} onClick={() => goToPage(page as number)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${
                  currentPage === page
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-100'
                    : 'border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700'
                }`}>
                {page}
              </button>
            )
          )}

          <button title="Page suivante" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronRight size={16} />
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