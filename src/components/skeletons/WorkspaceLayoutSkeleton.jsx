import Skeleton from "./Skeleton";

export default function WorkspaceLayoutSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-base">
      {/* Header Skeleton (Matches ProjectLayout header) */}
      <div className="px-6 pt-6 pb-4 border-b border-border-default bg-surface/10 shrink-0 flex flex-col gap-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="h-3 w-16" />
          <span className="text-[10px] text-zinc-600">›</span>
          <Skeleton variant="text" className="h-3 w-24" />
          <span className="text-[10px] text-zinc-600">›</span>
          <Skeleton variant="text" className="h-3 w-28" />
        </div>

        {/* Title and details row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="rect" className="h-8 w-44 rounded-md" />
            <Skeleton variant="rect" className="h-6 w-32 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="rect" className="h-8 w-8 rounded-md" />
            <Skeleton variant="rect" className="h-8 w-24 rounded-md" />
          </div>
        </div>

        {/* Tab view controllers skeleton */}
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rect" className="h-7 w-20 rounded-md" />
          ))}
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-grow p-6 space-y-6 overflow-hidden">
        {/* Simulating cards and table content loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border-default/40 bg-surface/20 rounded-xl p-5 space-y-4">
              <Skeleton variant="rect" className="h-5 w-24" />
              <Skeleton variant="text" className="h-8 w-full" />
              <div className="space-y-2 pt-2">
                <Skeleton variant="text" className="h-3 w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        <div className="border border-border-default/40 bg-surface/20 rounded-xl p-5 space-y-4">
          <Skeleton variant="rect" className="h-5 w-36" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border-default/20">
                <Skeleton variant="text" className="h-4 w-1/3" />
                <Skeleton variant="text" className="h-4 w-20" />
                <Skeleton variant="text" className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
