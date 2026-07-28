import Skeleton from "./Skeleton";

export default function TaskAssigneeSelectionSkeleton({ count = 3 }) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-1.5">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 bg-surface/30 border border-border-default/40 rounded-lg text-xs"
        >
          {/* Member Name placeholder */}
          <Skeleton variant="text" className="h-4 w-28" />
          
          {/* Assign/Remove button placeholder */}
          <Skeleton variant="rect" className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
