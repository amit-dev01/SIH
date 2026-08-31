import { ShieldCheck, BookOpen, ExternalLink, Calendar, Info } from 'lucide-react';
import { api } from '@/services/api';
import { Publication } from '@/types';

export default async function PublicationsPage() {
  let publications: Publication[] = [];
  let apiError: string | null = null;

  try {
    const res = await api.getPublications();
    if (res && res.success) {
      publications = res.data || [];
    } else {
      apiError = res.message || 'Unable to retrieve publications registry.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Page Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          KNOWLEDGE BASE
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Scientific Publications Repository
        </h1>
        <p className="text-sm text-muted-text max-w-2xl">
          National database of peer-reviewed articles, books, and scientific expedition reports produced by Indian polar research teams under the Ministry of Earth Sciences.
        </p>
      </div>

      {/* 2. Database Sync Alerts / Connection Offline Panel */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-8">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
          </p>
        </div>
      ) : publications.length === 0 ? (
        <div className="border border-card-border bg-card-bg p-16 text-center rounded-sm">
          <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Publications Indexed</p>
          <p className="text-xs text-muted-text mt-1">
            No scientific literature or campaign reports are currently cataloged in the repository.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-[11px] font-mono uppercase text-muted-text">
            Indexed Records: {publications.length} scientific documents
          </div>

          {/* Document list */}
          <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
            {publications.map((pub) => (
              <article
                key={pub.id}
                className="p-5 sm:p-6 bg-card-bg hover:bg-muted-bg/30 transition-colors flex flex-col gap-3"
              >
                {/* Title */}
                <h2 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug">
                  {pub.title}
                </h2>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono text-muted-text uppercase">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Published:{' '}
                    <span className="text-foreground font-semibold">
                      {new Date(pub.published_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </span>

                  {pub.doi && (
                    <>
                      <span className="hidden sm:inline text-slate-400">•</span>
                      <span className="flex items-center gap-1.5">
                        DOI:{' '}
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-color hover:underline flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-accent-color focus:ring-offset-1 rounded-sm px-0.5 font-semibold"
                        >
                          {pub.doi}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </span>
                    </>
                  )}

                  {pub.expedition_id && (
                    <>
                      <span className="hidden sm:inline text-slate-400">•</span>
                      <span className="flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-slate-500" />
                        Campaign Dossier:{' '}
                        <a
                          href={`/expeditions/${pub.expedition_id}`}
                          className="text-accent-color hover:underline font-semibold focus:outline-none focus:ring-1 focus:ring-accent-color focus:ring-offset-1 rounded-sm px-0.5"
                        >
                          {pub.expedition_id.slice(0, 8)}
                        </a>
                      </span>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
