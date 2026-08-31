import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Newspaper, Compass } from 'lucide-react';
import { api } from '@/services/api';
import { OutreachArticle } from '@/types';

interface ArticleParams {
  slug: string;
}

export default async function ArticleDetailPage(props: {
  params: Promise<ArticleParams>;
}) {
  const params = await props.params;
  const slug = params.slug;

  let article: OutreachArticle | null = null;
  let apiError: string | null = null;

  try {
    const res = await api.getPublishedOutreach();
    if (res && res.success) {
      const articles = res.data || [];
      article = articles.find((a) => a.slug === slug) || null;
    } else {
      apiError = res.message || 'Unable to query article indexes.';
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'Backend service is offline.';
  }

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6">
      {/* 1. Back Navigation Button */}
      <div>
        <Link
          href="/outreach"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-accent-color focus:ring-offset-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Outreach
        </Link>
      </div>

      {/* 2. Error / Not Found Fallbacks */}
      {apiError ? (
        <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-8 rounded-sm text-center my-6">
          <ShieldCheck className="h-8 w-8 text-error-color mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground font-serif">Database Sync Notice</p>
          <p className="text-xs text-muted-text mt-1 max-w-md mx-auto">
            {apiError}. Ensure the Express backend server is running locally on port 3001 or check system configurations.
          </p>
        </div>
      ) : !article ? (
        <div className="border border-card-border bg-card-bg p-12 text-center rounded-sm py-16">
          <Newspaper className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <h1 className="text-lg font-serif font-bold text-foreground">Article Not Found</h1>
          <p className="text-xs text-muted-text mt-1.5 max-w-md mx-auto leading-relaxed">
            The requested polar science outreach article &ldquo;<span className="font-semibold">{slug}</span>&rdquo; could not be located in our published archives.
          </p>
          <div className="mt-6">
            <Link
              href="/outreach"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-color hover:bg-accent-color text-primary-fg border border-card-border/20 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
            >
              Return to Feed
            </Link>
          </div>
        </div>
      ) : (
        /* 3. Detailed Scientific Article View */
        <article className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 border-b border-card-border pb-6">
            <div className="flex flex-wrap items-center gap-3">
              {article.category && (
                <span className="bg-accent-light/10 text-accent-color border border-accent-color/20 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm">
                  {article.category}
                </span>
              )}
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-text">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4.5xl font-serif font-bold tracking-tight text-foreground leading-tight">
              {article.title}
            </h1>
          </header>

          {/* Hero Banner Cover Image */}
          {article.cover_image_url && (
            <div className="w-full h-64 sm:h-[450px] bg-slate-900 border border-card-border rounded-sm overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_image_url}
                alt={`Illustrative banner for ${article.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Main Text Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none mt-4 font-sans text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
            {article.content.split('\n\n').map((paragraph, index) => {
              const text = paragraph.trim();
              if (!text) return null;
              return (
                <p key={index} className="mb-5">
                  {text}
                </p>
              );
            })}
          </div>

          {/* Related Metadata Section (if mapped) */}
          {article.expedition_id && (
            <div className="border border-card-border bg-card-bg/40 p-5 rounded-sm flex items-center gap-4 mt-8">
              <Compass className="h-5 w-5 text-accent-color flex-shrink-0" />
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    Related Campaign
                  </h4>
                  <p className="text-[11px] text-muted-text mt-0.5">
                    This educational content is linked to an active polar science expedition.
                  </p>
                </div>
                <Link
                  href="/expeditions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-color hover:bg-accent-color text-primary-fg border border-card-border/20 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors rounded-sm"
                >
                  View Dossier
                </Link>
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
