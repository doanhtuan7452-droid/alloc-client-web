import Skeleton from "../skeletons/Skeleton";

export default function NotificationListSkeleton({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <div className="divide-y divide-border-default/20">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex gap-3 p-3.5 bg-surface/10 border-b border-border-default/20"
        >
          {/* Circular icon placeholder */}
          <Skeleton variant="circle" className="w-8 h-8 border border-border-default/30" />
          
          {/* Notification message and time details */}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-3.5 w-5/6" />
            <Skeleton variant="text" className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
