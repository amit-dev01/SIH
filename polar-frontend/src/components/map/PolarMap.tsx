'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PolarStation } from '@/types';
import { AlertCircle, RotateCcw } from 'lucide-react';

// Esri World Dark Gray Base Style JSON configured programmatically
const darkStyle = {
  version: 8 as const,
  sources: {
    'esri-dark-gray': {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Esri, MapmyIndia, &copy; OpenStreetMap contributors, and the GIS user community'
    }
  },
  layers: [
    {
      id: 'esri-dark-gray-layer',
      type: 'raster' as const,
      source: 'esri-dark-gray',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

interface PolarMapProps {
  selectedStationId: string | null;
  stations: PolarStation[];
  onSelectStation: (stationId: string | null) => void;
}

export default function PolarMap({ selectedStationId, stations, onSelectStation }: PolarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, { marker: maplibregl.Marker; popup: maplibregl.Popup }>>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Reusable helper to fit all three polar stations in the map viewport
  const fitStationsInView = useCallback((duration = 1500) => {
    const map = mapRef.current;
    if (map) {
      const bounds = [
        [11.7300, -70.7667], // Southwest corner (Maitri Lng, Maitri Lat)
        [76.1950, 78.9233]   // Northeast corner (Bharati Lng, Himadri Lat)
      ] as [[number, number], [number, number]];

      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        essential: true,
        duration
      });
    }
  }, []);

  // Helper to reset the map to the initial global view
  const handleResetView = () => {
    if (mapRef.current) {
      onSelectStation(null);
      // Close all popups
      Object.values(markersRef.current).forEach(({ popup }) => {
        if (popup.isOpen()) popup.remove();
      });
      fitStationsInView(1500);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // 1. Initialize MapLibre
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: darkStyle,
        center: [30, 0], 
        zoom: 1,
        minZoom: 1,
        maxZoom: 14,
        dragRotate: false,
        touchPitch: false
      });

      mapRef.current = map;

      // 2. Add build-in navigation controls (zoom only)
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      // 3. Error listener
      map.on('error', (e: maplibregl.ErrorEvent) => {
        console.error('MapLibre GL error:', e);
        // Only set error if it seems to be a fatal style/tile load failure
        if (e.error?.message?.includes('Failed to fetch') || e.error?.message?.includes('style')) {
          setMapError('Failed to fetch cartography tiles. Visual map layer is offline.');
        }
      });

      // 4. Create and add custom markers
      stations.forEach((station) => {
        // Create custom HTML element for marker
        const el = document.createElement('div');
        el.className = 'custom-map-marker group relative';
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#06b6d4'; // Cyan primary
        el.style.border = '2px solid #ffffff';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.9)';
        el.style.zIndex = '10';

        // Inner pulsing halo
        const pulse = document.createElement('div');
        pulse.style.position = 'absolute';
        pulse.style.top = '-5px';
        pulse.style.left = '-5px';
        pulse.style.width = '20px';
        pulse.style.height = '20px';
        pulse.style.borderRadius = '50%';
        pulse.style.border = '1.5px solid rgba(6, 182, 212, 0.6)';
        pulse.style.animation = 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite';
        el.appendChild(pulse);

        // Standard Popup Content
        const popupHtml = `
          <div class="mapboxgl-popup-content-dark font-sans" style="padding: 12px; color: #f8fafc; min-width: 220px; border-radius: 4px; background: #070d19; border: 1px solid #1e293b;">
            <div style="font-size: 9px; font-family: monospace; text-transform: uppercase; color: #06b6d4; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${station.region} • ${station.station_type}
            </div>
            <h3 style="margin: 0; font-family: Georgia, serif; font-size: 15px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 6px; color: #f8fafc;">
              ${station.name}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 11px; line-height: 1.4; color: #cbd5e1;">
              ${station.description}
            </p>
            <div style="font-size: 9px; font-family: monospace; color: #94a3b8; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 5px; display: flex; justify-content: space-between;">
              <span>LAT: ${Math.abs(station.latitude).toFixed(4)}°${station.latitude >= 0 ? 'N' : 'S'}</span>
              <span>LNG: ${Math.abs(station.longitude).toFixed(4)}°${station.longitude >= 0 ? 'E' : 'W'}</span>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 12,
          closeButton: false,
          closeOnClick: false,
          maxWidth: '300px'
        }).setHTML(popupHtml);

        // Bind clicks to popup open state and selection tracking
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectStation(station.id);
        });

        // Initialize MapLibre Marker and attach to coordinates
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .addTo(map);

        // Store reference to marker and popup
        markersRef.current[station.id] = { marker, popup };
      });

      // Map container click resets selection
      map.on('click', () => {
        onSelectStation(null);
      });

      // Set load flag asynchronously to prevent render warnings
      map.on('load', () => {
        setMapLoaded(true);
        fitStationsInView(0); // fit bounds immediately on map load
      });

    } catch (err) {
      console.error('MapLibre GL failed initialization:', err);
      const msg = err instanceof Error ? err.message : 'WebGL not supported';
      setTimeout(() => {
        setMapError(`Critical rendering error. ${msg}`);
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
      setMapLoaded(false);
    };
  }, [stations, onSelectStation, fitStationsInView]);

  // Sync selectedStationId with Map flyTo and popup actions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove active popups first
    Object.values(markersRef.current).forEach(({ popup }) => {
      if (popup.isOpen()) {
        popup.remove();
      }
    });

    if (selectedStationId) {
      const station = stations.find((s) => s.id === selectedStationId);
      const refs = markersRef.current[selectedStationId];

      if (station && refs) {
        // Center view on selected station
        map.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 5.5,
          essential: true,
          duration: 1500
        });

        // Open popup
        refs.popup.setLngLat([station.longitude, station.latitude]).addTo(map);
      }
    }
  }, [selectedStationId, stations]);

  return (
    <div className="relative w-full h-[550px] border border-card-border rounded-sm overflow-hidden bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Reset View Overlay control */}
      {mapLoaded && (
        <button
          onClick={handleResetView}
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-card-border/60 hover:border-accent-color text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200 transition-colors shadow-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-color"
          aria-label="Reset map viewpoint"
        >
          <RotateCcw className="h-3 w-3" />
          Reset View
        </button>
      )}

      {/* Cartographic Error Overlay */}
      {mapError && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 z-20">
          <AlertCircle className="h-8 w-8 text-error-color mb-3" />
          <p className="text-sm font-semibold text-foreground font-serif">Cartography Layer Offline</p>
          <p className="text-xs text-muted-text mt-1 max-w-sm">
            {mapError} The coordinate markers list remains fully functional.
          </p>
        </div>
      )}
    </div>
  );
}
