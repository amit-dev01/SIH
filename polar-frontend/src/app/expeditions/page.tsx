import Link from 'next/link';
import { ShieldCheck, Calendar, MapPin, Anchor, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { api } from '@/services/api';
import { Expedition } from '@/types';
import FilterPanel from './FilterPanel';

interface SearchParams {
  search?: string;
  region?: string;
  status?: string;
  year?: string;
  page?: string;
}

export default async function ExpeditionsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  
  const search = searchParams.search || '';
  const region = searchParams.region || '';
  const status = searchParams.status || '';
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 9; // Grid friendly limit

  let expeditions: Expedition[] = [];
  let apiError: string | null = null;
  let totalPages = 1;
  let totalItems = 0;

  try {
    const res = await api.getExpeditions({
      search,
      region,
      status,
      year,
      page,
      limit,
      sortBy: 'start_date',
      sortOrder: 'desc'
    });

    if (res && res.success) {
      expeditions = res.data || [];
      if (res.meta) {
        totalPages = res.meta.totalPages || 1;
        totalItems = res.meta.total || 0;
      }
    } else {
      apiError = res.message || 'Unable to retrieve expeditions.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  // Helper to compile pagination query strings
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (status) params.set('status', status);
    if (year) params.set('year', String(year));
    params.set('page', String(pageNumber));
    return `/expeditions?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Editorial Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          CENTRAL ARCHIVES
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Scientific Expedition Registry
        </h1>
        <p className="text-sm text-muted-text max-w-2xl">
          Historical logbook and dossier collection of Indian polar research campaigns across Antarctica, the Arctic, and Himalayan systems.
        </p>
      </div>

      {/* Filter panel */}
      <FilterPanel
        currentSearch={search}
        currentRegion={region}
        currentStatus={status}
        currentYear={year ? String(year) : ''}
      />

      {/* API Connection error warning */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-8">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the POLARIS backend server is running locally on port 3000 or configure the `NEXT_PUBLIC_API_URL` environment variable.
          </p>
        </div>
      ) : expeditions.length === 0 ? (
        <div className="border border-card-border bg-card-bg p-16 text-center rounded-sm">
          <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Expeditions Found</p>
          <p className="text-xs text-muted-text mt-1">
            No records in the registry match the current search filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Metadata result count */}
          <div className="text-[11px] font-mono uppercase text-muted-text">
            Showing {expeditions.length} of {totalItems} campaigns indexed in registry
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expeditions.map((exp) => (
              <div
                key={exp.id}
                className="border border-card-border bg-card-bg flex flex-col justify-between hover:border-accent-color/40 transition-all rounded-sm overflow-hidden group"
              >
                {/* Visual Banner */}
                <div className="h-44 w-full bg-slate-900 flex items-center justify-center relative border-b border-card-border/10 overflow-hidden">
                  {exp.cover_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={exp.cover_image_url}
                      alt={exp.title}
                      className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-center p-4">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-accent-color" />
                        {exp.region.replace('_', ' ')}
                      </div>
                      <span className="font-serif text-sm font-bold text-slate-200 line-clamp-2">
                        {exp.title}
                      </span>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-slate-950/80 text-white px-2 py-0.5 border border-slate-700/50 uppercase rounded-sm">
                    {exp.status}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-accent-color font-semibold uppercase tracking-wider">
                      {exp.region.replace('_', ' ')}
                    </span>
                    <h3 className="font-serif text-base font-bold tracking-tight line-clamp-1 group-hover:text-accent-color transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-muted-text line-clamp-3 leading-relaxed">
                      {exp.summary || exp.description}
                    </p>
                  </div>

                  {/* Metadata Stats */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[10px] font-mono text-muted-text">
                    <div className="flex justify-between">
                      <span>DEPARTURE</span>
                      <span className="text-foreground font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {new Date(exp.start_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>LEADER</span>
                      <span className="text-foreground font-semibold uppercase flex items-center gap-1">
                        <Anchor className="h-3 w-3 text-slate-500" />
                        {exp.leader?.name || 'Not Listed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Dossier Link */}
                <Link
                  href={`/expeditions/${exp.slug}`}
                  className="bg-muted-bg hover:bg-accent-light/10 text-center py-3 text-[11px] font-bold uppercase tracking-wider border-t border-card-border transition-colors hover:text-accent-color"
                >
                  View Science Dossier
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-card-border/60 pt-6 mt-4">
              <Link
                href={getPageUrl(page - 1)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-card-border rounded-sm bg-card-bg transition-colors ${
                  page <= 1
                    ? 'pointer-events-none opacity-40'
                    : 'hover:bg-muted-bg hover:text-accent-color'
                }`}
                aria-disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Page
              </Link>

              <span className="text-[11px] font-mono text-muted-text uppercase">
                Page {page} of {totalPages}
              </span>

              <Link
                href={getPageUrl(page + 1)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-card-border rounded-sm bg-card-bg transition-colors ${
                  page >= totalPages
                    ? 'pointer-events-none opacity-40'
                    : 'hover:bg-muted-bg hover:text-accent-color'
                }`}
                aria-disabled={page >= totalPages}
              >
                Next Page
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
