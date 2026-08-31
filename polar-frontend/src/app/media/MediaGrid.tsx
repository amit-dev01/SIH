'use client';

import { useState } from 'react';
import { Film, ImageIcon, Eye } from 'lucide-react';
import { Media } from '@/types';
import Lightbox from './Lightbox';

interface MediaGridProps {
  mediaList: Media[];
}

export default function MediaGrid({ mediaList = [] }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mediaList.map((item) => {
          const isVideo = item.type === 'VIDEO' || item.file_url.match(/\.(mp4|webm|ogg)$/i);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="border border-card-border bg-card-bg group cursor-pointer hover:border-accent-color/40 transition-all rounded-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Media Thumbnail viewport */}
              <div className="h-48 w-full bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-card-border/10">
                {item.thumbnail_url || item.type === 'PHOTO' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.thumbnail_url || item.file_url}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-center p-4">
                    <span className="font-serif text-sm font-bold text-slate-200 line-clamp-2">
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Hover overlay action */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-slate-900/90 border border-slate-700/60 p-2 text-white flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider rounded-sm">
                    <Eye className="h-3.5 w-3.5 text-accent-color" />
                    Open Archive
                  </div>
                </div>

                {/* Media Type Badge Tag */}
                <span className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-slate-950/80 text-white px-2 py-0.5 border border-slate-700/50 uppercase rounded-sm flex items-center gap-1">
                  {isVideo ? (
                    <>
                      <Film className="h-2.5 w-2.5 text-accent-color" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-2.5 w-2.5 text-accent-color" />
                      Photo
                    </>
                  )}
                </span>
              </div>

              {/* Title & Metadata Card Footer */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-accent-color transition-colors leading-snug">
                  {item.title}
                </h3>
                <span className="text-[9px] font-mono text-muted-text uppercase tracking-wider block">
                  File ID: {item.id.slice(0, 8)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
