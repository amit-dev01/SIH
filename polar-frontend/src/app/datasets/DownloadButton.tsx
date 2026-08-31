'use client';

import { useState } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';

interface DownloadButtonProps {
  datasetId: string;
  title: string;
  format: string;
}

export default function DownloadButton({ datasetId, title, format }: DownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage(null);

    const downloadUrl = api.getDatasetDownloadUrl(datasetId);

    try {
      const response = await fetch(downloadUrl, { method: 'GET' });

      if (!response.ok) {
        let errText = `HTTP Error ${response.status}`;
        try {
          const body = await response.json();
          if (body && body.message) {
            errText = body.message;
          }
        } catch {
          // If body is not JSON or can't be read, default to status code info
          if (response.status === 404) {
            errText = 'The requested telemetry file could not be found on the server (404).';
          }
        }
        throw new Error(errText);
      }

      // Convert response to file blob
      const blob = await response.blob();
      
      // Trigger native browser download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      // Clean filename
      const cleanName = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      a.download = `${cleanName}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      a.remove();

      setStatus('success');
      // Reset back to idle status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Dataset download failure:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error: Failed to connect to download server.');
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end w-full sm:w-auto">
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all focus:outline-none focus:ring-1 focus:ring-accent-color focus:ring-offset-1 ${
          status === 'loading'
            ? 'bg-muted-bg border-card-border text-muted-text cursor-wait'
            : status === 'success'
            ? 'bg-success-color/10 border-success-color text-success-color'
            : 'bg-primary-color hover:bg-accent-color text-primary-fg border-card-border/20 cursor-pointer hover:border-transparent'
        }`}
        aria-label={`Download dataset: ${title}`}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-color" />
            Downloading
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            Download File
          </>
        )}
      </button>

      {/* Inline Warning/Error Banner */}
      {status === 'error' && errorMessage && (
        <div 
          className="flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-error-color rounded-sm text-[10px] max-w-[280px] text-right"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span className="leading-normal">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
