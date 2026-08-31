export default function OutreachLoading() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Header / Hero Skeleton */}
      <div className="border-b border-card-border pb-6 flex flex-col gap-3 animate-pulse">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          PUBLIC EDUCATION
        </div>
        <div className="h-8 w-64 sm:w-96 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-sm mt-2" />
      </div>

      {/* Grid items skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-card-border bg-card-bg rounded-sm overflow-hidden flex flex-col h-[350px]">
            {/* Image block placeholder */}
            <div className="w-full h-44 bg-slate-200 dark:bg-slate-800" />
            
            {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-3 justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                <div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded-sm" />
                <div className="h-3.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
              </div>
              <div className="h-4.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
