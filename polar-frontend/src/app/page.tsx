import Link from 'next/link';
import { Compass, Database, FileText, Globe, ArrowRight, ShieldCheck, MapPin, Activity } from 'lucide-react';
import { api } from '@/services/api';
import { Expedition } from '@/types';

// India's Active Polar Research Stations
const POLAR_STATIONS = [
  {
    name: 'BHARATI',
    region: 'Antarctica (Larsemann Hills)',
    coords: '69° 24.4\' S, 76° 11.7\' E',
    established: '2012',
    status: 'ACTIVE / YEAR-ROUND',
  },
  {
    name: 'MAITRI',
    region: 'Antarctica (Schirmacher Oasis)',
    coords: '70° 46.0\' S, 11° 43.8\' E',
    established: '1989',
    status: 'ACTIVE / YEAR-ROUND',
  },
  {
    name: 'HIMADRI',
    region: 'Arctic (Ny-Ålesund, Svalbard)',
    coords: '78° 55.4\' N, 11° 56.2\' E',
    established: '2008',
    status: 'ACTIVE / SEASONAL',
  },
];

export default async function Home() {
  let recentExpeditions: Expedition[] = [];
  let apiError: string | null = null;

  try {
    const res = await api.getExpeditions({ limit: 3, sortBy: 'start_date', sortOrder: 'desc' });
    if (res && res.success) {
      recentExpeditions = res.data;
    } else {
      apiError = res.message || 'Unable to retrieve expeditions.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section (Glacial Editorial Cover) */}
      <section className="relative overflow-hidden bg-slate-950 text-slate-100 border-b border-card-border/25 py-24 sm:py-32">
        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl flex flex-col gap-6">
            <div className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-accent-color rounded-sm">
              <Globe className="h-3 w-3" />
              National Polar Information Infrastructure
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Polar Science Outreach & Dissemination Portal
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Discover historical telemetry data, publications, and scientific field archives from India&apos;s polar research expeditions to the Antarctic, Arctic, and Himalayan regions under the Ministry of Earth Sciences.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/expeditions"
                className="inline-flex items-center gap-2 bg-accent-color hover:bg-accent-color/90 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 transition-colors rounded-sm"
              >
                Explore Expeditions
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/datasets"
                className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-500 text-slate-200 font-semibold text-xs uppercase tracking-wider px-5 py-3 transition-all rounded-sm"
              >
                Access Datasets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Polar Stations Grid (Scientific Credibility Info) */}
      <section className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-card-border pb-6 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-accent-color font-semibold block mb-1">
            RESEARCH CENTERS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            India&apos;s Active Polar Presence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POLAR_STATIONS.map((station) => (
            <div
              key={station.name}
              className="border border-card-border bg-card-bg p-6 flex flex-col justify-between hover:border-accent-color/50 transition-colors rounded-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-serif text-lg font-bold tracking-tight">
                    {station.name}
                  </span>
                  <span className="text-[9px] font-mono bg-muted-bg px-2 py-0.5 border border-card-border/50 text-muted-text font-bold uppercase">
                    {station.status}
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-muted-text uppercase font-mono text-[10px]">Location</span>
                    <span className="font-semibold text-right">{station.region}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-muted-text uppercase font-mono text-[10px]">Coordinates</span>
                    <span className="font-mono text-right">{station.coords}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-muted-text uppercase font-mono text-[10px]">Established</span>
                    <span className="font-semibold text-right">{station.established}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Repository Pillars */}
      <section className="bg-muted-bg/60 border-y border-card-border/40 py-16">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-slate-900 dark:bg-slate-800 text-accent-color border border-card-border/25 flex items-center justify-center rounded-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-base font-bold tracking-tight">Scientific Campaigns</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Track annual expeditions to Antarctica and Svalbard, detailing objectives, crew leadership profiles, and milestone summaries.
                </p>
                <Link href="/expeditions" className="text-xs font-semibold text-accent-color hover:underline inline-flex items-center gap-1 mt-1">
                  Browse registry →
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-slate-900 dark:bg-slate-800 text-accent-color border border-card-border/25 flex items-center justify-center rounded-sm">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-base font-bold tracking-tight">Open Data Repository</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Access meteorological data, solar radiation files, and geological sampling telemetry licensed under government scientific guidelines.
                </p>
                <Link href="/datasets" className="text-xs font-semibold text-accent-color hover:underline inline-flex items-center gap-1 mt-1">
                  Download archives →
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-slate-900 dark:bg-slate-800 text-accent-color border border-card-border/25 flex items-center justify-center rounded-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-base font-bold tracking-tight">Publications Database</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Query peer-reviewed publications and conference articles generated from MoES-funded polar research teams.
                </p>
                <Link href="/publications" className="text-xs font-semibold text-accent-color hover:underline inline-flex items-center gap-1 mt-1">
                  Search papers →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Expeditions Section */}
      <section className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b border-card-border pb-6 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-accent-color font-semibold block mb-1">
              FIELDWORK PROGRESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Recent Polar Expeditions
            </h2>
          </div>
          <Link
            href="/expeditions"
            className="text-xs font-bold text-accent-color hover:text-accent-color/80 uppercase tracking-wider flex items-center gap-1"
          >
            All Expeditions
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* API Error Handling */}
        {apiError ? (
          <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-6 rounded-sm text-center">
            <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">Database Sync Notice</p>
            <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
              {apiError}. Ensure the POLARIS backend server is running locally on port 3000 or configure the `NEXT_PUBLIC_API_URL` environment variable.
            </p>
          </div>
        ) : recentExpeditions.length === 0 ? (
          <div className="border border-card-border bg-card-bg p-12 text-center rounded-sm">
            <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-muted-text">No active or logged expeditions found in the directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentExpeditions.map((exp) => (
              <div
                key={exp.id}
                className="border border-card-border bg-card-bg hover:border-accent-color/40 transition-all flex flex-col justify-between rounded-sm overflow-hidden"
              >
                {/* Fallback polar graphic or photo */}
                <div className="h-44 w-full bg-slate-900 flex items-center justify-center relative border-b border-card-border/10">
                  {exp.cover_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={exp.cover_image_url}
                      alt={exp.title}
                      className="h-full w-full object-cover opacity-80"
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

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-base font-bold tracking-tight line-clamp-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-muted-text line-clamp-3 leading-relaxed">
                      {exp.summary || exp.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-muted-text">
                    <div>
                      LEADER: <span className="text-foreground font-semibold uppercase">{exp.leader?.name || 'N/A'}</span>
                    </div>
                    <div>
                      {new Date(exp.start_date).getFullYear()}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/expeditions/${exp.slug}`}
                  className="bg-muted-bg hover:bg-accent-light/10 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider border-t border-card-border transition-colors hover:text-accent-color"
                >
                  View Science Dossier
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
