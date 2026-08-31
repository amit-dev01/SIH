'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Expedition } from '@/types';

interface MediaFiltersProps {
  currentType?: string;
  currentExpeditionId?: string;
  expeditions: Expedition[];
}

const MEDIA_TYPES = [
  { label: 'All Formats', value: '' },
  { label: 'Photography (PHOTO)', value: 'PHOTO' },
  { label: 'Video Logs (VIDEO)', value: 'VIDEO' },
];

export default function MediaFilters({
  currentType = '',
  currentExpeditionId = '',
  expeditions = [],
}: MediaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState(currentType);
  const [expeditionId, setExpeditionId] = useState(currentExpeditionId);

  const applyFilters = (newFilters: { type?: string; expeditionId?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const merged = { type, expeditionId, ...newFilters };

    Object.entries(merged).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/media?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setType('');
    setExpeditionId('');
    startTransition(() => {
      router.push('/media');
    });
  };

  return (
    <div className="border border-card-border bg-card-bg p-5 rounded-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-card-border/60 pb-3">
        <Filter className="h-4 w-4 text-accent-color" />
        <span className="font-mono text-xs uppercase tracking-wider font-bold">Filter Archives</span>
        {isPending && (
          <span className="ml-auto text-[10px] text-accent-color font-mono uppercase animate-pulse">
            Syncing...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        {/* Media Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">File Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              applyFilters({ type: e.target.value });
            }}
            className="w-full bg-background border border-card-border px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-accent-color"
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expedition Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">Campaign Association</label>
          <select
            value={expeditionId}
            onChange={(e) => {
              setExpeditionId(e.target.value);
              applyFilters({ expeditionId: e.target.value });
            }}
            className="w-full bg-background border border-card-border px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-accent-color"
          >
            <option value="">All Science Campaigns</option>
            {expeditions.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-2 justify-end border-t border-card-border/40 pt-4 mt-1">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 bg-muted-bg hover:bg-card-border/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-text rounded-sm border border-card-border transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
