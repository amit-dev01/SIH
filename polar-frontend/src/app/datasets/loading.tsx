export default function DatasetsLoading() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-3 animate-pulse">
        <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-8 w-64 sm:w-96 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />

        {/* Dataset list skeletons */}
        <div className="flex flex-col border border-card-border divide-y divide-card-border rounded-sm overflow-hidden bg-card-bg">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-bg animate-pulse">
              <div className="flex flex-col gap-2.5 flex-1">
                {/* Title */}
                <div className="h-4.5 w-3/4 sm:w-2/3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                
                {/* Metadata row */}
                <div className="flex gap-4">
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                </div>
              </div>
              
              {/* Button */}
              <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
