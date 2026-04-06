
// Skeleton loader pour les cartes patient — remplace le spinner

export function PatientCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 overflow-hidden animate-pulse">
      
      {/* Avatar + infos */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Avatar */}
        <div className="shrink-0 w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100" />
        
        <div className="min-w-0 flex-1 space-y-2">
          {/* Nom + num dossier */}
          <div className="flex items-center gap-2">
            <div className="h-4 sm:h-5 bg-slate-100 rounded w-36 sm:w-48" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
          {/* Infos secondaires */}
          <div className="flex gap-3">
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        </div>
      </div>

      {/* Date + bouton */}
      <div className="flex items-center justify-between lg:justify-end gap-6 sm:gap-10 border-t lg:border-t-0 pt-3 lg:pt-0">
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-100 rounded w-20" />
          <div className="h-3.5 bg-slate-100 rounded w-24" />
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export function PatientCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PatientCardSkeleton key={i} />
      ))}
    </div>
  );
}