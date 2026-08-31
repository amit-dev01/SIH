export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-3 animate-pulse">
        <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-8 w-64 sm:w-96 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>

      {/* Large Search Bar Skeleton */}
      <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 border border-card-border rounded-sm animate-pulse" />

      {/* Results Columns Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 animate-pulse">
        {[1, 2].map((group) => (
          <div key={group} className="flex flex-col gap-4">
            {/* Group Title */}
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            
            {/* Group Items */}
            <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex flex-col gap-2.5 bg-card-bg">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="h-4.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
