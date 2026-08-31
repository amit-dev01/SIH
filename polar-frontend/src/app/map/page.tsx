'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Compass, MapPin, Eye, ServerCrash } from 'lucide-react';
import { polarStations } from '@/data/polarStations';

// Dynamically import PolarMap to prevent SSR compilation errors from MapLibre GL
const PolarMap = dynamic(() => import('@/components/map/PolarMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-slate-950 border border-card-border rounded-sm flex items-center justify-center animate-pulse">
      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
        Loading Cartography Canvas...
      </span>
    </div>
  )
});

export default function MapPage() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Page Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          POLAR CARTOGRAPHY
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          India&apos;s Polar Research Presence
        </h1>
        <p className="text-sm text-muted-text max-w-3xl">
          Interactive visualization of India&apos;s active research stations. Explore facilities operating across the Arctic and Antarctic circles.
        </p>
      </div>

      {/* 2. Main Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cartography Window */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <PolarMap
            selectedStationId={selectedStationId}
            stations={polarStations}
            onSelectStation={setSelectedStationId}
          />
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 leading-normal">
            <span>Projection: Web Mercator</span>
            <span>•</span>
            <span>Attribution: MapLibre GL JS & CartoDB tiles</span>
          </div>
        </div>

        {/* Station Explorer Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-card-border pb-2">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2">
              <Compass className="h-4 w-4 text-accent-color" />
              Station Explorer
            </h2>
          </div>

          <div className="flex flex-col gap-4" role="list">
            {polarStations.map((station) => {
              const isSelected = selectedStationId === station.id;
              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`p-4 border rounded-sm transition-all flex flex-col gap-2.5 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'border-accent-color bg-muted-bg/50 shadow-sm'
                      : 'border-card-border/60 bg-card-bg hover:border-card-border hover:bg-muted-bg/30'
                  }`}
                  role="button"
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedStationId(station.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-accent-color font-semibold">
                        {station.region}
                      </span>
                      <h3 className="text-sm font-sans font-bold text-foreground mt-0.5">
                        {station.name}
                      </h3>
                    </div>
                    <MapPin className={`h-4 w-4 transition-colors ${isSelected ? 'text-accent-color' : 'text-slate-400'}`} />
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-text">
                    {station.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-card-border/60 pt-2.5 mt-1">
                    <span className="text-[9px] font-mono text-slate-500">
                      {Math.abs(station.latitude).toFixed(4)}°{station.latitude >= 0 ? 'N' : 'S'},{' '}
                      {Math.abs(station.longitude).toFixed(4)}°{station.longitude >= 0 ? 'E' : 'W'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStationId(station.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border rounded-sm transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-accent-color text-white border-transparent'
                          : 'bg-primary-color hover:bg-accent-color text-primary-fg border-card-border/20 hover:border-transparent'
                      }`}
                      aria-label={`Focus map on ${station.name} station`}
                    >
                      <Eye className="h-3 w-3" />
                      View on Map
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Future Backend Geo-Data Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-card-border/60 bg-card-bg/40 p-6 rounded-sm mt-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-color flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-color animate-pulse" />
            Currently Available
          </h3>
          <p className="text-xs text-muted-text leading-relaxed">
            India&apos;s polar research presence. Displays geographical coordinates, facilities operational descriptions, and regional parameters for Arctic and Antarctic station networks.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ServerCrash className="h-3.5 w-3.5" />
            Future Data Layers (Schema Pending)
          </h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Expedition tracks, telemetry paths, dynamic voyage statuses, and geographically tagged media archives can be mapped interactively once coordinates become available from MoES API feeds.
          </p>
        </div>
      </div>
    </div>
  );
}
