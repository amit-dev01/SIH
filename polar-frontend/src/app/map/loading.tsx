export default function MapLoading() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-2 animate-pulse">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          POLAR CARTOGRAPHY
        </div>
        <div className="h-8 w-64 sm:w-96 bg-slate-200 dark:bg-slate-800 rounded-sm mt-2" />
        <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-sm mt-1" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="w-full h-[550px] bg-slate-200 dark:bg-slate-800 border border-card-border rounded-sm animate-pulse flex items-center justify-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 animate-bounce">
              Loading Cartography Tiles...
            </span>
          </div>
        </div>

        {/* Sidebar Station List Skeletons */}
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-card-border/60 bg-card-bg/40 flex flex-col gap-2 rounded-sm">
                <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-sm mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
