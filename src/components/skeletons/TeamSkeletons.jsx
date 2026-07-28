import Skeleton from "./Skeleton";

export function MemberListSkeleton({ count = 5 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3.5 bg-surface/20 border border-border-default/40 rounded-xl"
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar skeleton */}
            <Skeleton variant="rect" className="w-11 h-11 rounded-xl border border-border-default/50" />
            
            {/* Name and email details */}
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="h-4.5 w-1/3" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
          </div>

          {/* Role and status indicators */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Skeleton variant="rect" className="h-5 w-24 rounded-full" />
            <Skeleton variant="text" className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RequestListSkeleton({ count = 2 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="bg-inset/40 border border-border-default/40 p-3 rounded-lg flex flex-col gap-3"
        >
          {/* Header metadata */}
          <div className="flex justify-between items-center">
            <Skeleton variant="text" className="h-4 w-28" />
            <Skeleton variant="rect" className="h-4.5 w-12 rounded" />
          </div>

          {/* Body details */}
          <Skeleton variant="text" className="h-3.5 w-5/6" />

          {/* Buttons */}
          <div className="flex gap-2 mt-1">
            <Skeleton variant="rect" className="h-7 w-20 rounded-md" />
            <Skeleton variant="rect" className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewCycleListSkeleton({ count = 2 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="bg-inset/40 border border-border-default/40 p-3 rounded-lg flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <Skeleton variant="text" className="h-4 w-36" />
            <Skeleton variant="rect" className="h-4.5 w-12 rounded-full" />
          </div>

          {/* Progress or status info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-3 w-8" />
            </div>
            <Skeleton variant="rect" className="h-2 w-full rounded-full" />
          </div>

          {/* Footer action button placeholder */}
          <div className="pt-1 flex justify-end">
            <Skeleton variant="rect" className="h-6 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
