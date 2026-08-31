'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, FileText, Image, BookOpen, Download, Link2 } from 'lucide-react';
import { Publication, Dataset, Media } from '@/types';

interface DossierTabsProps {
  description: string;
  datasets: Dataset[];
  publications: Publication[];
  media: Media[];
}

export default function DossierTabs({
  description,
  datasets = [],
  publications = [],
  media = [],
}: DossierTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'publications' | 'media'>('overview');

  const tabs = [
    { id: 'overview', name: 'Campaign Overview', icon: BookOpen, count: null },
    { id: 'datasets', name: 'Associated Datasets', icon: Database, count: datasets.length },
    { id: 'publications', name: 'Research Publications', icon: FileText, count: publications.length },
    { id: 'media', name: 'Media Logs', icon: Image, count: media.length },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Selectors */}
      <div className="border-b border-card-border flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all ${
                active
                  ? 'border-accent-color text-accent-color bg-accent-light/10 font-bold'
                  : 'border-transparent text-muted-text hover:text-foreground hover:border-card-border'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-1 px-1.5 py-0.5 text-[9px] font-mono border rounded-full ${
                  active ? 'bg-accent-color/20 border-accent-color/45 text-accent-color' : 'bg-muted-bg border-card-border text-muted-text'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Contents */}
      <div className="bg-card-bg border border-card-border p-6 rounded-sm min-h-[300px]">
        
        {/* 1. Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
              Scientific Background & Campaign Goals
            </h3>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* 2. Datasets */}
        {activeTab === 'datasets' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
              Open Telemetry & Sensor Datasets
            </h3>
            {datasets.length === 0 ? (
              <p className="text-xs text-muted-text py-4">No datasets registered for this campaign.</p>
            ) : (
              <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden">
                {datasets.map((dataset) => (
                  <div key={dataset.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/50 hover:bg-muted-bg/30 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-sm font-bold text-foreground">{dataset.title}</span>
                      <div className="flex gap-3 text-[10px] font-mono text-muted-text">
                        <span>FORMAT: <span className="text-foreground uppercase font-semibold">{dataset.format}</span></span>
                        <span>•</span>
                        <span>DOWNLOADS: <span className="text-foreground font-semibold">{dataset.download_count}</span></span>
                      </div>
                    </div>
                    <Link
                      href={`/datasets/${dataset.id}/download`}
                      className="inline-flex items-center gap-1.5 bg-muted-bg hover:bg-accent-color hover:text-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-text border border-card-border rounded-sm transition-all"
                    >
                      <Download className="h-3 w-3" />
                      Download File
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Publications */}
        {activeTab === 'publications' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
              Academic Journals & Research Reports
            </h3>
            {publications.length === 0 ? (
              <p className="text-xs text-muted-text py-4">No publications registered for this campaign.</p>
            ) : (
              <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden">
                {publications.map((pub) => (
                  <div key={pub.id} className="p-4 bg-background/50 hover:bg-muted-bg/30 transition-colors flex flex-col gap-2">
                    <span className="font-serif text-sm font-bold text-foreground leading-snug">{pub.title}</span>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-text">
                      <span>PUBLISHED: <span className="text-foreground font-semibold">{new Date(pub.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span></span>
                      {pub.doi && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            DOI:
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-color hover:underline flex items-center gap-0.5"
                            >
                              {pub.doi}
                              <Link2 className="h-2.5 w-2.5" />
                            </a>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Media Logs */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
              Field photography & Video telemetry Logs
            </h3>
            {media.length === 0 ? (
              <p className="text-xs text-muted-text py-4">No media logs uploaded for this campaign.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="border border-card-border bg-background rounded-sm overflow-hidden flex flex-col group">
                    <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                      {item.thumbnail_url || item.type === 'PHOTO' ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumbnail_url || item.file_url}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-gradient-to-br from-slate-900 to-slate-950 inset-0 absolute flex items-center justify-center">
                          {item.type} LOG
                        </div>
                      )}
                      <span className="absolute top-2 right-2 text-[8px] font-mono font-bold bg-slate-950/80 text-slate-100 px-1.5 py-0.5 border border-slate-700/50 uppercase rounded-sm">
                        {item.type}
                      </span>
                    </div>
                    <div className="p-3 border-t border-card-border">
                      <span className="font-sans text-xs font-bold text-foreground block line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
