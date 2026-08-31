import Link from 'next/link';
import { ShieldCheck, Compass, FileText, Database, Image as ImageIcon, ArrowRight, CornerDownRight, Inbox } from 'lucide-react';
import { api } from '@/services/api';
import { SearchResults } from '@/types';
import SearchForm from './SearchForm';

interface SearchParams {
  q?: string;
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';

  let results: SearchResults | null = null;
  let apiError: string | null = null;
  let totalCount = 0;

  if (query) {
    try {
      const res = await api.getSearchResults(query);
      if (res && res.success) {
        results = res.data;
        
        // Calculate total count
        if (results) {
          totalCount += results.expeditions?.length || 0;
          totalCount += results.publications?.length || 0;
          totalCount += results.datasets?.length || 0;
          totalCount += results.media?.length || 0;
        }
      } else {
        apiError = res.message || 'Unable to query search indices.';
      }
    } catch (err) {
      apiError = err instanceof Error ? err.message : 'Backend service is offline.';
    }
  }

  const hasResults = results && totalCount > 0;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Page Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          DISCOVERY PORTAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Global Knowledge Search
        </h1>
        <p className="text-sm text-muted-text max-w-2xl">
          Unified query portal indexing polar campaigns, telemetry datasets, peer-reviewed publications, and visual field logs.
        </p>
      </div>

      {/* 2. Interactive Client-side Search Form */}
      <SearchForm initialQuery={query} />

      {/* 3. Render Query States */}
      
      {/* State A: Connection/Database Error */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-6">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
          </p>
        </div>
      ) : !query ? (
        /* State B: Empty Initial State */
        <div className="border border-card-border bg-card-bg/60 p-12 text-center rounded-sm py-16">
          <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground font-serif">Polar Knowledge Index</p>
          <p className="text-xs text-muted-text mt-1.5 max-w-md mx-auto leading-relaxed">
            Enter a search query in the field above to discover relevant polar expeditions, data logs, or publications cataloged under the Ministry of Earth Sciences.
          </p>
        </div>
      ) : !hasResults ? (
        /* State C: No Results Found */
        <div className="border border-card-border bg-card-bg p-12 text-center rounded-sm py-16">
          <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold">No Results Found</p>
          <p className="text-xs text-muted-text mt-1">
            No polar records found for query &ldquo;<span className="font-semibold text-foreground">{query}</span>&rdquo;.
          </p>
        </div>
      ) : (
        /* State D: Results Display Layout */
        <div className="flex flex-col gap-8">
          {/* Query Stats */}
          <div className="text-[11px] font-mono uppercase text-muted-text border-b border-card-border/60 pb-3">
            Search query &ldquo;<span className="text-foreground font-semibold">{query}</span>&rdquo; returned {totalCount} indexed items
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category 1: Expeditions */}
            {results?.expeditions && results.expeditions.length > 0 && (
              <section className="flex flex-col gap-4" aria-labelledby="expedition-results-title">
                <div className="flex items-center gap-2 border-b border-card-border/60 pb-2">
                  <Compass className="h-4 w-4 text-accent-color" />
                  <h2 id="expedition-results-title" className="font-mono text-xs uppercase tracking-wider font-bold">
                    Expeditions ({results.expeditions.length})
                  </h2>
                </div>
                <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
                  {results.expeditions.map((exp) => (
                    <div key={exp.id} className="p-4 flex flex-col gap-1 bg-card-bg hover:bg-muted-bg/30 transition-colors">
                      <span className="text-[9px] font-mono uppercase text-accent-color">{exp.region.replace('_', ' ')}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">{exp.title}</h3>
                      {exp.slug ? (
                        <Link
                          href={`/expeditions/${exp.slug}`}
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-accent-color hover:underline mt-2.5 focus:outline-none focus:ring-1 focus:ring-accent-color"
                        >
                          <CornerDownRight className="h-3 w-3" />
                          View Science Dossier
                        </Link>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 uppercase mt-2">Dossier unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category 2: Datasets */}
            {results?.datasets && results.datasets.length > 0 && (
              <section className="flex flex-col gap-4" aria-labelledby="dataset-results-title">
                <div className="flex items-center gap-2 border-b border-card-border/60 pb-2">
                  <Database className="h-4 w-4 text-accent-color" />
                  <h2 id="dataset-results-title" className="font-mono text-xs uppercase tracking-wider font-bold">
                    Telemetry Datasets ({results.datasets.length})
                  </h2>
                </div>
                <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
                  {results.datasets.map((dataset) => (
                    <div key={dataset.id} className="p-4 flex flex-col gap-1 bg-card-bg hover:bg-muted-bg/30 transition-colors">
                      <span className="text-[9px] font-mono uppercase text-slate-500">FORMAT: {dataset.format}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">{dataset.title}</h3>
                      <Link
                        href="/datasets"
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-accent-color hover:underline mt-2.5 focus:outline-none focus:ring-1 focus:ring-accent-color"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        Go to Data Repository
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category 3: Publications */}
            {results?.publications && results.publications.length > 0 && (
              <section className="flex flex-col gap-4" aria-labelledby="publication-results-title">
                <div className="flex items-center gap-2 border-b border-card-border/60 pb-2">
                  <FileText className="h-4 w-4 text-accent-color" />
                  <h2 id="publication-results-title" className="font-mono text-xs uppercase tracking-wider font-bold">
                    Research Publications ({results.publications.length})
                  </h2>
                </div>
                <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
                  {results.publications.map((pub) => (
                    <div key={pub.id} className="p-4 flex flex-col gap-1.5 bg-card-bg hover:bg-muted-bg/30 transition-colors">
                      <h3 className="text-xs sm:text-sm font-serif font-bold text-foreground leading-snug line-clamp-2">{pub.title}</h3>
                      <div className="flex items-center justify-between gap-4 mt-2">
                        {pub.doi ? (
                          <a
                            href={`https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-accent-color hover:underline focus:outline-none focus:ring-1 focus:ring-accent-color"
                          >
                            Open DOI
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <Link
                            href="/publications"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-accent-color hover:underline focus:outline-none focus:ring-1 focus:ring-accent-color"
                          >
                            Publications Registry
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category 4: Media */}
            {results?.media && results.media.length > 0 && (
              <section className="flex flex-col gap-4" aria-labelledby="media-results-title">
                <div className="flex items-center gap-2 border-b border-card-border/60 pb-2">
                  <ImageIcon className="h-4 w-4 text-accent-color" />
                  <h2 id="media-results-title" className="font-mono text-xs uppercase tracking-wider font-bold">
                    Media Archives ({results.media.length})
                  </h2>
                </div>
                <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
                  {results.media.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col gap-1 bg-card-bg hover:bg-muted-bg/30 transition-colors">
                      <span className="text-[9px] font-mono uppercase text-slate-500">TYPE: {item.type}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">{item.title}</h3>
                      <Link
                        href="/media"
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-accent-color hover:underline mt-2.5 focus:outline-none focus:ring-1 focus:ring-accent-color"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        Go to Media Gallery
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
