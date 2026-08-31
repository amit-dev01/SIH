'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  initialQuery?: string;
}

export default function SearchForm({ initialQuery = '' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (cleanQuery) {
      params.set('q', cleanQuery);
    } else {
      params.delete('q');
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('q');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-3">
      <div className="relative flex-1">
        <label htmlFor="global-search-input" className="sr-only">
          Search polar science portal
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          id="global-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query expeditions, datasets, or publication DOIs..."
          className="w-full pl-10 pr-10 py-3 bg-card-bg text-foreground border border-card-border focus:outline-none focus:border-accent-color text-sm rounded-sm transition-all focus:ring-1 focus:ring-accent-color"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-foreground focus:outline-none"
            aria-label="Clear query input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-primary-color hover:bg-accent-color text-primary-fg border border-card-border/20 hover:border-transparent text-sm font-bold uppercase tracking-wider transition-colors rounded-sm cursor-pointer"
      >
        Submit
      </button>
    </form>
  );
}
