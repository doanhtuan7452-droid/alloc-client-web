import Skeleton from "./Skeleton";

export default function WorkspaceCardSkeleton() {
  return (
    <div className="border border-border-default bg-surface/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Workspace Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="h-6 w-40" />
            <Skeleton variant="rect" className="h-5 w-16" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Skeleton variant="circle" className="w-1.5 h-1.5" />
            <Skeleton variant="text" className="h-3 w-28" />
          </div>
        </div>

        <div className="shrink-0 mr-9">
          <Skeleton variant="rect" className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Projects List Container Skeleton */}
      <div className="border-t border-border-default/30 pt-3">
        <Skeleton variant="text" className="h-3 w-20 mb-3" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-3 bg-inset/40 border border-border-default/30 rounded-lg h-[72px]"
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton variant="text" className="h-4 w-28" />
                <Skeleton variant="rect" className="h-4.5 w-16 rounded-full" />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <Skeleton variant="text" className="h-3 w-16" />
                <Skeleton variant="text" className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
