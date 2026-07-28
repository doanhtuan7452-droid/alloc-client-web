import Skeleton from "./Skeleton";

export default function TimesheetActivitySkeleton({ count = 3 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-4">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-surface/30 border border-border-default/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          {/* Left panel: project info, task details */}
          <div className="space-y-2.5 flex-1">
            {/* Project tag placeholder */}
            <Skeleton variant="rect" className="h-4.5 w-24 rounded" />
            
            {/* Task Name placeholder */}
            <Skeleton variant="text" className="h-4.5 w-2/3" />
            
            {/* Optional Comment placeholder */}
            <Skeleton variant="text" className="h-3 w-1/2 italic" />
          </div>

          {/* Right panel: hours badge placeholders */}
          <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0 self-start sm:self-center">
            <div className="flex gap-2">
              <Skeleton variant="rect" className="h-5 w-20 rounded" />
              <Skeleton variant="rect" className="h-5.5 w-16 rounded" />
            </div>
            <Skeleton variant="text" className="h-3 w-28 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
