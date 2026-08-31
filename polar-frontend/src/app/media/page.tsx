import { ShieldCheck, Activity } from 'lucide-react';
import { api } from '@/services/api';
import { Media, Expedition } from '@/types';
import MediaFilters from './MediaFilters';
import MediaGrid from './MediaGrid';

interface SearchParams {
  type?: string;
  expeditionId?: string;
}

export default async function MediaPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  
  const type = searchParams.type || '';
  const expeditionId = searchParams.expeditionId || '';

  let mediaList: Media[] = [];
  let expeditions: Expedition[] = [];
  let apiError: string | null = null;

  // 1. Fetch campaigns for filtering
  try {
    const expRes = await api.getExpeditions({ limit: 100 });
    if (expRes && expRes.success) {
      expeditions = expRes.data || [];
    }
  } catch (err) {
    console.error('Failed to pre-fetch expeditions for filters:', err);
    // Continue: if expeditions fail to load, filter list is just empty
  }

  // 2. Fetch media list matching parameters
  try {
    const mediaRes = await api.getMedia({ type, expeditionId });
    if (mediaRes && mediaRes.success) {
      mediaList = mediaRes.data || [];
    } else {
      apiError = mediaRes.message || 'Unable to retrieve media records.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Editorial Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          FIELD ARCHIVES
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Scientific Media Gallery
        </h1>
        <p className="text-sm text-muted-text max-w-2xl">
          Visual dossier logbook containing cataloged fieldwork photography, equipment setups, and polar station video logs.
        </p>
      </div>

      {/* Filter panel */}
      <MediaFilters
        currentType={type}
        currentExpeditionId={expeditionId}
        expeditions={expeditions}
      />

      {/* API connection status or offline alerts */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-8">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
          </p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="border border-card-border bg-card-bg p-16 text-center rounded-sm">
          <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Media Found</p>
          <p className="text-xs text-muted-text mt-1">
            No logged records match the selected file type or campaign filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-[11px] font-mono uppercase text-muted-text">
            Found {mediaList.length} files matching query params
          </div>
          <MediaGrid mediaList={mediaList} />
        </div>
      )}
    </div>
  );
}
