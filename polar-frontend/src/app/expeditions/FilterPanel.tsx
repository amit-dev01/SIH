'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const REGIONS = [
  { label: 'All Regions', value: '' },
  { label: 'Arctic', value: 'ARCTIC' },
  { label: 'Antarctic', value: 'ANTARCTIC' },
  { label: 'Himalaya', value: 'HIMALAYA' },
  { label: 'Southern Ocean', value: 'SOUTHERN_OCEAN' },
];

const STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function FilterPanel({
  currentSearch = '',
  currentRegion = '',
  currentStatus = '',
  currentYear = '',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [region, setRegion] = useState(currentRegion);
  const [status, setStatus] = useState(currentStatus);
  const [year, setYear] = useState(currentYear);

  const applyFilters = (newFilters: { search?: string; region?: string; status?: string; year?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // Reset to page 1 on new search filters
    params.set('page', '1');

    const merged = { search, region, status, year, ...newFilters };

    Object.entries(merged).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/expeditions?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearch('');
    setRegion('');
    setStatus('');
    setYear('');
    startTransition(() => {
      router.push('/expeditions');
    });
  };

  return (
    <div className="border border-card-border bg-card-bg p-5 rounded-sm flex flex-col gap-5">
      <div className="flex items-center gap-2 border-b border-card-border/60 pb-3">
        <Filter className="h-4 w-4 text-accent-color" />
        <span className="font-mono text-xs uppercase tracking-wider font-bold">Filter Registry</span>
        {isPending && <span className="ml-auto text-[10px] text-accent-color font-mono uppercase animate-pulse">Syncing...</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search Query */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">Search Keyword</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Bharati, Maitri, Ice core"
              className="w-full bg-background border border-card-border px-3 py-2 text-xs placeholder:text-slate-500 rounded-sm focus:outline-none focus:border-accent-color"
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
            />
            <button
              onClick={() => applyFilters({ search })}
              className="absolute right-2.5 top-2.5 text-muted-text hover:text-foreground"
              aria-label="Submit search"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Region Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">Geographic Region</label>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              applyFilters({ region: e.target.value });
            }}
            className="w-full bg-background border border-card-border px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-accent-color"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">Expedition Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              applyFilters({ status: e.target.value });
            }}
            className="w-full bg-background border border-card-border px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-accent-color"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase text-muted-text">Year of Departure</label>
          <input
            type="number"
            min="1980"
            max="2030"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2026"
            className="w-full bg-background border border-card-border px-3 py-2 text-xs placeholder:text-slate-500 rounded-sm focus:outline-none focus:border-accent-color"
            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ year })}
          />
        </div>
      </div>

      {/* Button controls */}
      <div className="flex gap-2 justify-end border-t border-card-border/40 pt-4">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 bg-muted-bg hover:bg-card-border/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-text rounded-sm border border-card-border transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Clear Filters
        </button>
        <button
          onClick={() => applyFilters({})}
          className="bg-primary-color hover:bg-accent-color text-primary-fg px-5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-sm border border-transparent"
        >
          Query Database
        </button>
      </div>
    </div>
  );
}
