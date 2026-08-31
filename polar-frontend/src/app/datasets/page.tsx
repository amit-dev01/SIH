import { ShieldCheck, Database, FileSpreadsheet, HardDrive, Download } from 'lucide-react';
import { api } from '@/services/api';
import { Dataset } from '@/types';
import DownloadButton from './DownloadButton';

export default async function DatasetsPage() {
  let datasets: Dataset[] = [];
  let apiError: string | null = null;

  try {
    const res = await api.getDatasets();
    if (res && res.success) {
      datasets = res.data || [];
    } else {
      apiError = res.message || 'Unable to retrieve datasets registry.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Page Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          DATA REPOSITORY
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Scientific Datasets Portal
        </h1>
        <p className="text-sm text-muted-text max-w-2xl">
          Central repository for open-access telemetry, ice-core metadata, and meteorological logs collected during Indian scientific campaigns.
        </p>
      </div>

      {/* 2. Database Sync Alerts / Connection Offline Panel */}
      {apiError ? (
        <div className="flex flex-col gap-6">
          <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center">
            <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
            <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
              {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
            </p>
          </div>

          {/* Sandbox testing row */}
          <div className="border border-card-border p-6 rounded-sm bg-card-bg flex flex-col gap-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-card-border/60 pb-2">
              Telemetry Download Sandbox (Test Action)
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-foreground">TEST_GLACIOLOGY_CORE_TELEMETRY</span>
                <div className="flex gap-3 text-[10px] font-mono text-muted-text uppercase">
                  <span>FORMAT: NETCDF</span>
                  <span>•</span>
                  <span>ID: test-dataset-uuid-01</span>
                </div>
              </div>
              <DownloadButton datasetId="test-dataset-uuid-01" title="TEST_GLACIOLOGY_CORE_TELEMETRY" format="NETCDF" />
            </div>
          </div>
        </div>
      ) : datasets.length === 0 ? (
        <div className="border border-card-border bg-card-bg p-16 text-center rounded-sm">
          <Database className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Datasets Cataloged</p>
          <p className="text-xs text-muted-text mt-1">
            No scientific datasets are currently cataloged in this repository.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-[11px] font-mono uppercase text-muted-text">
            Indexed Archives: {datasets.length} scientific datasets available
          </div>

          {/* Dataset list layout */}
          <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
            {datasets.map((dataset) => {
              const isSpreadsheet = ['CSV', 'XLS', 'XLSX'].includes(dataset.format.toUpperCase());
              return (
                <div
                  key={dataset.id}
                  className="p-5 sm:p-6 bg-card-bg hover:bg-muted-bg/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                >
                  {/* Info block */}
                  <div className="flex gap-4 flex-1">
                    {/* Visual File Icon */}
                    <div className="flex-shrink-0 h-10 w-10 bg-muted-bg border border-card-border/60 text-slate-500 flex items-center justify-center rounded-sm">
                      {isSpreadsheet ? (
                        <FileSpreadsheet className="h-5 w-5 text-accent-color" />
                      ) : (
                        <HardDrive className="h-5 w-5 text-accent-color" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="font-sans text-sm sm:text-base font-bold text-foreground leading-snug">
                        {dataset.title}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-muted-text uppercase">
                        <span>
                          ID: <span className="text-foreground select-all">{dataset.id}</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span>
                          Format:{' '}
                          <span className="text-foreground font-semibold uppercase">{dataset.format}</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Downloads:{' '}
                          <span className="text-foreground font-semibold">{dataset.download_count}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive client-side download handler */}
                  <DownloadButton
                    datasetId={dataset.id}
                    title={dataset.title}
                    format={dataset.format}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
