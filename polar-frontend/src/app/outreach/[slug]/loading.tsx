export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Back button skeleton */}
      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />

      {/* Header Info */}
      <div className="flex flex-col gap-4 animate-pulse">
        {/* Category & Date */}
        <div className="flex gap-4">
          <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        </div>
        {/* Title */}
        <div className="h-8 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>

      {/* Hero Image */}
      <div className="w-full h-64 sm:h-96 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />

      {/* Body paragraphs */}
      <div className="flex flex-col gap-4 animate-pulse mt-4">
        {[1, 2, 3].map((paragraph) => (
          <div key={paragraph} className="flex flex-col gap-2.5">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
