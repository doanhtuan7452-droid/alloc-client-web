// Loading skeleton for Gantt Chart view.
// Glassmorphism design system matching the rest of the application.
import Skeleton from "./Skeleton";

export default function GanttSkeleton() {
  const rows = [1, 2, 3, 4, 5];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="bg-surface/20 border-t border-border-default/40 flex-1 overflow-hidden flex">
        
        {/* Cột trái: Tên & Thông tin chi tiết Task (Chiều ngang cố định) */}
        <div className="w-[320px] md:w-[350px] shrink-0 border-r border-border-default/40 bg-surface/5 flex flex-col overflow-hidden">
          {/* Header Cột Trái */}
          <div className="h-16 shrink-0 border-b border-border-default/40 px-6 flex items-center justify-between bg-surface/10">
            <Skeleton variant="text" className="h-4 w-32" />
            <Skeleton variant="rect" className="h-4 w-4 rounded" />
          </div>
          
          {/* Danh sách Task Cột Trái giả lập */}
          <div className="flex-1 space-y-0.5 overflow-hidden">
            {rows.map((rowId) => (
              <div key={rowId} className="h-16 border-b border-border-default/20 px-6 py-4 flex items-center justify-between shrink-0 bg-surface/5">
                <div className="flex flex-col gap-1.5 w-3/4 pr-3">
                  <div className="flex items-center gap-1.5">
                    <Skeleton variant="text" className="h-3 w-12" />
                    <Skeleton variant="text" className="h-3 w-8" />
                  </div>
                  <Skeleton variant="text" className="h-4 w-5/6" />
                </div>
                <Skeleton variant="circle" className="w-6 h-6 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Lưới Gantt cuộn giả lập */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Lưới Gantt */}
          <div className="h-16 shrink-0 border-b border-border-default/40 overflow-hidden bg-surface/10 flex flex-col justify-between">
            <div className="h-8 bg-surface/5 border-b border-border-default/20 flex items-center px-4 gap-24">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>
            <div className="h-8 flex items-center px-4 justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="text" className="h-3.5 w-12" />
              ))}
            </div>
          </div>

          {/* Body Lưới Gantt giả lập với các thanh tiến độ */}
          <div className="flex-1 divide-y divide-border-default/20 bg-surface/5">
            {rows.map((rowId) => {
              // Phân bổ ngẫu nhiên độ dài và lề trái của thanh Gantt giả lập
              const widths = ["w-1/4", "w-1/3", "w-1/2", "w-2/5", "w-1/5"];
              const margins = ["ml-6", "ml-24", "ml-12", "ml-40", "ml-2"];
              const width = widths[rowId % widths.length];
              const margin = margins[rowId % margins.length];

              return (
                <div key={rowId} className="h-16 relative flex items-center px-4">
                  <div className={`h-8 bg-skeleton border border-border-default/30 rounded-full ${width} ${margin} opacity-60 flex items-center px-3 animate-pulse`}>
                    <Skeleton variant="text" className="h-3 w-8" />
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
