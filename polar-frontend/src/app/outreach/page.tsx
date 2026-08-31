import Link from 'next/link';
import { ShieldCheck, BookOpen, Clock, ArrowRight, Newspaper } from 'lucide-react';
import { api } from '@/services/api';
import { OutreachArticle } from '@/types';

export default async function OutreachPage() {
  let articles: OutreachArticle[] = [];
  let apiError: string | null = null;

  try {
    const res = await api.getPublishedOutreach();
    if (res && res.success) {
      articles = res.data || [];
    } else {
      apiError = res.message || 'Unable to retrieve outreach feed.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* 1. Page Hero / Header */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          PUBLIC EDUCATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
          Polar Science Outreach
        </h1>
        <p className="text-sm text-muted-text max-w-3xl leading-relaxed">
          POLARIS bridges the gap between polar science and society. Explore peer-reviewed breakthroughs, expedition updates, and climate alerts made accessible to researchers, educators, students, and the public.
        </p>
      </div>

      {/* 2. Error & Connection Status Panel */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-6">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div className="border border-card-border bg-card-bg p-16 text-center rounded-sm">
          <Newspaper className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Outreach Content Published</p>
          <p className="text-xs text-muted-text mt-1">
            No public outreach articles are currently cataloged in this repository.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-[11px] font-mono uppercase text-muted-text">
            Indexed Articles: {articles.length} news items available
          </div>

          {/* Card feed grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <article
                  key={article.id}
                  className="border border-card-border bg-card-bg rounded-sm overflow-hidden flex flex-col justify-between group hover:border-card-border/80 transition-colors"
                >
                  {/* Card Thumbnail */}
                  {article.cover_image_url ? (
                    <div className="relative w-full h-44 bg-slate-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.cover_image_url}
                        alt={`Cover for ${article.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {article.category && (
                        <span className="absolute top-3 left-3 bg-slate-900/90 text-accent-color px-2 py-0.5 text-[9px] font-mono uppercase border border-card-border/60 tracking-wider">
                          {article.category}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-44 bg-slate-900/50 flex items-center justify-center border-b border-card-border/40 relative">
                      <BookOpen className="h-8 w-8 text-slate-500" />
                      {article.category && (
                        <span className="absolute top-3 left-3 bg-slate-900/90 text-accent-color px-2 py-0.5 text-[9px] font-mono uppercase border border-card-border/60 tracking-wider">
                          {article.category}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-text">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </div>

                      <h2 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-accent-color transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h2>

                      <p className="text-xs text-muted-text leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="border-t border-card-border/60 pt-3">
                      <Link
                        href={`/outreach/${article.slug}`}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-accent-color hover:underline focus:outline-none focus:ring-1 focus:ring-accent-color"
                      >
                        Read Article
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
