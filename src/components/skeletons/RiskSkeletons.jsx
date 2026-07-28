import Skeleton from "./Skeleton";

export function RiskListSkeleton({ count = 3 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl border border-border-default/40 bg-surface/30 flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 w-full">
            {/* Risk details block */}
            <div className="space-y-2 flex-1 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Risk ID skeleton */}
                <Skeleton variant="text" className="h-4.5 w-16 font-mono" />
                
                {/* Risk Severity badge */}
                <Skeleton variant="rect" className="h-4.5 w-14 rounded-full" />
                
                {/* Risk status */}
                <Skeleton variant="rect" className="h-4.5 w-12 rounded-full" />
              </div>

              {/* Risk Title */}
              <Skeleton variant="text" className="h-5 w-3/4" />
              
              {/* Risk Description */}
              <Skeleton variant="text" className="h-3.5 w-5/6" />
            </div>

            {/* Score & Assignee badges */}
            <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0 self-start sm:self-center">
              <div className="flex items-center gap-1.5 bg-inset/50 p-1.5 rounded-lg border border-border-default/20 w-32 justify-between">
                <Skeleton variant="text" className="h-3 w-10" />
                <Skeleton variant="rect" className="h-5 w-8 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circle" className="w-5 h-5" />
                <Skeleton variant="text" className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RiskLifecycleSkeleton({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-4">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="p-3 bg-surface/30 border border-border-default/40 rounded-lg flex flex-col gap-2.5"
        >
          {/* Action header and timestamp */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" className="w-5 h-5" />
              <Skeleton variant="text" className="h-4 w-28" />
            </div>
            <Skeleton variant="text" className="h-3.5 w-32 font-mono" />
          </div>

          {/* Details log block */}
          <div className="pl-7 space-y-1.5">
            <Skeleton variant="text" className="h-3 w-full" />
            <Skeleton variant="text" className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
