import Skeleton from "./Skeleton";

export default function CalendarSkeleton() {
  const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  // Generate 35 cells for a standard 5-week month grid
  const cells = Array.from({ length: 35 });

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-base">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {/* Header Toolbar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface/5 border border-border-default/40">
          <div className="flex items-center gap-3">
            <Skeleton variant="rect" className="h-6 w-44 rounded" />
            <Skeleton variant="rect" className="h-6 w-28 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="rect" className="h-8 w-24 rounded-lg" />
            <Skeleton variant="rect" className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col border border-border-default/40 bg-surface/5 rounded-xl overflow-hidden min-h-[500px]">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border-default bg-surface/10 py-3 text-center">
            {weekdays.map((day, idx) => (
              <div key={idx} className="flex justify-center">
                <Skeleton variant="text" className="h-4.5 w-12" />
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 flex-grow divide-x divide-y divide-border-default/30 bg-base/10">
            {cells.map((_, idx) => {
              // Add a fake event indicator to some days to simulate actual calendar contents
              const hasEvent = idx % 5 === 2 || idx % 7 === 4;
              const hasTwoEvents = idx % 9 === 1;

              return (
                <div key={idx} className="p-2 min-h-[90px] flex flex-col gap-1.5 justify-between">
                  {/* Day Number */}
                  <div className="flex justify-between items-start">
                    <Skeleton variant="text" className="h-3.5 w-4" />
                    {idx === 14 && (
                      <Skeleton variant="circle" className="w-1.5 h-1.5 bg-blue-500" />
                    )}
                  </div>

                  {/* Simulated Tasks inside the day */}
                  <div className="space-y-1 mt-auto w-full">
                    {hasEvent && (
                      <Skeleton variant="rect" className="h-4.5 w-full rounded bg-blue-500/10 border border-blue-500/20" />
                    )}
                    {hasTwoEvents && (
                      <>
                        <Skeleton variant="rect" className="h-4.5 w-full rounded bg-purple-500/10 border border-purple-500/20" />
                        <Skeleton variant="rect" className="h-4.5 w-full rounded bg-emerald-500/10 border border-emerald-500/20" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
