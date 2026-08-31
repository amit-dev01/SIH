'use client';

import { useEffect, useRef } from 'react';
import { X, Film, ImageIcon, Info, Download } from 'lucide-react';
import { Media } from '@/types';

interface LightboxProps {
  item: Media;
  onClose: () => void;
}

export default function Lightbox({ item, onClose }: LightboxProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Focus the close button on mount for accessibility
    closeButtonRef.current?.focus();

    // Prevent body scroll when open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Handle click on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const isVideo = item.type === 'VIDEO' || item.file_url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-sm overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* Top Control Bar */}
        <div className="flex justify-between items-center bg-slate-950 py-3 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isVideo ? (
              <Film className="h-4 w-4 text-accent-color" />
            ) : (
              <ImageIcon className="h-4 w-4 text-accent-color" />
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Media Archive Log
            </span>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all rounded-sm"
            aria-label="Close viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Viewer viewport */}
        <div className="flex-1 min-h-[250px] sm:min-h-[400px] max-h-[70vh] bg-slate-950/40 flex items-center justify-center p-4">
          {isVideo ? (
            <video
              src={item.file_url}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full object-contain"
              aria-label={item.title}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.file_url}
              alt={item.title}
              className="max-h-[60vh] max-w-full object-contain"
            />
          )}
        </div>

        {/* Info footer dossier block */}
        <div className="bg-slate-950 p-5 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-slate-300">
          <div className="flex flex-col gap-1.5 flex-1">
            <h3 id="lightbox-title" className="font-serif text-base font-bold text-white leading-snug">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                ID: <span className="text-slate-300">{item.id.slice(0, 8)}</span>
              </span>
              <span>•</span>
              <span>
                TYPE: <span className="text-slate-300">{item.type}</span>
              </span>
            </div>
          </div>

          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex-shrink-0 inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-colors text-white font-mono text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Open Source File
          </a>
        </div>
      </div>
    </div>
  );
}
