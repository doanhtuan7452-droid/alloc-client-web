// Loading skeleton for Gantt Chart view.
// Glassmorphism design system matching the rest of the application.

export default function GanttSkeleton() {
  const rows = [1, 2, 3, 4, 5];

  return (
    <div className="flex-1 overflow-hidden flex flex-col animate-pulse">
      <div className="bg-white/[0.03] border-t border-white/10 flex-1 overflow-hidden flex">
        
        {/* Cột trái: Tên & Thông tin chi tiết Task (Chiều ngang cố định) */}
        <div className="w-[320px] md:w-[350px] shrink-0 border-r border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
          {/* Header Cột Trái */}
          <div className="h-16 shrink-0 border-b border-white/10 px-6 flex items-center justify-between bg-white/[0.02]">
            <div className="h-4 w-32 bg-neutral-800 rounded"></div>
            <div className="h-4 w-4 bg-neutral-800 rounded"></div>
          </div>
          
          {/* Danh sách Task Cột Trái giả lập */}
          <div className="flex-1 space-y-0.5 overflow-hidden">
            {rows.map((rowId) => (
              <div key={rowId} className="h-16 border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 bg-white/[0.005]">
                <div className="flex flex-col gap-1.5 w-3/4 pr-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-12 bg-neutral-850 bg-neutral-800 rounded"></div>
                    <div className="h-3 w-8 bg-neutral-850 bg-neutral-800 rounded"></div>
                  </div>
                  <div className="h-4 w-5/6 bg-neutral-850 bg-neutral-800 rounded"></div>
                </div>
                <div className="w-6 h-6 rounded-full bg-neutral-850 bg-neutral-800"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Lưới Gantt cuộn giả lập */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Lưới Gantt */}
          <div className="h-16 shrink-0 border-b border-white/10 overflow-hidden bg-white/[0.02] flex flex-col justify-between">
            <div className="h-8 bg-white/[0.02] border-b border-white/10 flex items-center px-4 gap-24">
              <div className="h-4 w-24 bg-neutral-805 bg-neutral-800 rounded"></div>
              <div className="h-4 w-24 bg-neutral-805 bg-neutral-800 rounded"></div>
            </div>
            <div className="h-8 flex items-center px-4 justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-3 w-12 bg-neutral-805 bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>

          {/* Body Lưới Gantt giả lập với các thanh tiến độ */}
          <div className="flex-1 divide-y divide-white/5 bg-white/[0.005]">
            {rows.map((rowId) => {
              // Phân bổ ngẫu nhiên độ dài và lề trái của thanh Gantt giả lập
              const widths = ["w-1/4", "w-1/3", "w-1/2", "w-2/5", "w-1/5"];
              const margins = ["ml-6", "ml-24", "ml-12", "ml-40", "ml-2"];
              const width = widths[rowId % widths.length];
              const margin = margins[rowId % margins.length];

              return (
                <div key={rowId} className="h-16 relative flex items-center px-4">
                  <div className={`h-8 bg-neutral-800 border border-white/5 rounded-full ${width} ${margin} opacity-60 flex items-center px-3`}>
                    <div className="h-3 w-8 bg-neutral-850 rounded"></div>
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
