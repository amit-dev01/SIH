import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, ShieldCheck, Anchor, User, FileText, Database, Image as ImageIcon, Download } from 'lucide-react';
import { api } from '@/services/api';
import { ExpeditionDetail, ExpeditionStats } from '@/types';
import DossierTabs from './DossierTabs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExpeditionDetailPage(props: PageProps) {
  const { slug } = await props.params;

  let expedition: ExpeditionDetail | null = null;
  let stats: ExpeditionStats | null = null;
  let apiError: string | null = null;
  let is404 = false;

  try {
    const detailRes = await api.getExpeditionDetails(slug);
    if (detailRes && detailRes.success && detailRes.data) {
      expedition = detailRes.data;
      
      // Fetch separate statistics metrics
      try {
        const statsRes = await api.getExpeditionStats(expedition.id);
        if (statsRes && statsRes.success) {
          stats = statsRes.data;
        }
      } catch (statsErr) {
        console.error('Failed to load expedition stats:', statsErr);
        // Stats failure doesn't crash the page; fallback to length counters
      }
    } else {
      is404 = true;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '';
    if (errorMsg.includes('404') || errorMsg.toLowerCase().includes('not found')) {
      is404 = true;
    } else {
      apiError = errorMsg || 'Failed to establish database synchronization.';
    }
  }

  if (is404) {
    notFound();
  }

  if (apiError || !expedition) {
    return (
      <div className="mx-auto max-w-3xl w-full px-4 py-24 text-center">
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Expedition Sync Failure</p>
          <p className="text-xs text-muted-text mt-1">
            {apiError || 'Failed to load details for this campaign.'}
          </p>
          <div className="mt-6">
            <Link
              href="/expeditions"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-color hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Registry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback stats counters if stats endpoint failed
  const publicationsCount = stats ? stats.publications : (expedition.publications?.length || 0);
  const datasetsCount = stats ? stats.datasets : (expedition.datasets?.length || 0);
  const mediaCount = stats ? stats.media : (expedition.media?.length || 0);
  const downloadsCount = stats ? stats.totalDownloads : (expedition.datasets?.reduce((sum, d) => sum + (d.download_count || 0), 0) || 0);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Navigation Breadcrumb */}
      <div>
        <Link
          href="/expeditions"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-text hover:text-accent-color transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to campaign registry
        </Link>
      </div>

      {/* 2. Hero Dossier Title Banner */}
      <div className="border border-card-border bg-card-bg p-6 sm:p-8 rounded-sm flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        {/* Decorative corner coordinate watermark */}
        <div className="absolute -right-12 -bottom-6 font-mono text-[56px] text-slate-100 dark:text-slate-900/40 pointer-events-none font-bold select-none leading-none tracking-tighter">
          {expedition.region.slice(0, 3)}
        </div>

        <div className="relative flex flex-col gap-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-bold bg-slate-900 text-slate-100 px-2 py-0.5 uppercase rounded-sm border border-slate-700/50">
              {expedition.region.replace('_', ' ')}
            </span>
            <span className="text-[9px] font-mono font-bold bg-muted-bg text-muted-text border border-card-border px-2 py-0.5 uppercase rounded-sm">
              {expedition.status}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl">
            {expedition.title}
          </h1>

          <p className="text-xs sm:text-sm text-muted-text max-w-2xl leading-relaxed">
            {expedition.summary || 'No summary overview provided for this science campaign.'}
          </p>
        </div>
      </div>

      {/* 3. Scientific Metadata Dossier & Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Tabbed details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DossierTabs
            description={expedition.description}
            datasets={expedition.datasets || []}
            publications={expedition.publications || []}
            media={expedition.media || []}
          />
        </div>

        {/* Right Sidebar: Scientific Metadata dossier card */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Metrics grid */}
          <div className="border border-card-border bg-slate-950 dark:bg-card-bg text-slate-100 rounded-sm p-5 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 border-r border-slate-800 pr-2">
              <FileText className="h-4 w-4 text-accent-color flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-slate-500">Publications</span>
                <span className="text-sm font-bold font-mono text-white">{publicationsCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <Database className="h-4 w-4 text-accent-color flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-slate-500">Datasets</span>
                <span className="text-sm font-bold font-mono text-white">{datasetsCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-800 pt-4 border-r pr-2">
              <ImageIcon className="h-4 w-4 text-accent-color flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-slate-500">Media Logs</span>
                <span className="text-sm font-bold font-mono text-white">{mediaCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-800 pt-4 pl-2">
              <Download className="h-4 w-4 text-accent-color flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-slate-500">Downloads</span>
                <span className="text-sm font-bold font-mono text-white">{downloadsCount}</span>
              </div>
            </div>
          </div>

          {/* Dossier Card */}
          <div className="border border-card-border bg-card-bg rounded-sm p-6 flex flex-col gap-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold border-b border-card-border/60 pb-2">
              Dossier Metadata
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-[10px] font-mono uppercase text-muted-text flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Departure Date
                </span>
                <span className="font-semibold">
                  {new Date(expedition.start_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {expedition.end_date && (
                <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-[10px] font-mono uppercase text-muted-text flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Return Date
                  </span>
                  <span className="font-semibold">
                    {new Date(expedition.end_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-[10px] font-mono uppercase text-muted-text flex items-center gap-1">
                  <Anchor className="h-3 w-3" />
                  Campaign Leader
                </span>
                <span className="font-semibold uppercase">{expedition.leader?.name || 'Not Registered'}</span>
                {expedition.leader?.email && (
                  <span className="text-[10px] font-mono text-muted-text lowercase select-all">
                    {expedition.leader.email}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-muted-text flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Archivist
                </span>
                <span className="font-semibold uppercase">{expedition.created_by_user?.name || 'MoES Admin'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
