// Loading skeleton for Kanban Board.
// Glassmorphism design system matching the rest of the application.
import Skeleton from "./Skeleton";

export default function BoardSkeleton() {
  const columns = [
    { title: "To Do", dotColor: "bg-blue-500/30 border border-blue-500/40" },
    { title: "In Progress", dotColor: "bg-cyan-500/30 border border-cyan-500/40" },
    { title: "Review", dotColor: "bg-amber-500/30 border border-amber-500/40" },
    { title: "Done", dotColor: "bg-emerald-500/30 border border-emerald-500/40" }
  ];

  return (
    <div className="flex-grow p-4 md:p-6 h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start flex-1 overflow-y-auto custom-scrollbar pr-1">
        {columns.map((col, idx) => (
          <div key={idx} className="bg-surface/20 rounded-xl border border-border-default/40 flex flex-col min-h-[400px]">
            {/* Column Header Placeholder */}
            <div className="p-4 border-b border-border-default/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                <Skeleton variant="text" className="h-5 w-20" />
                <Skeleton variant="rect" className="h-4.5 w-6 rounded-full" />
              </div>
            </div>

            {/* Cards Placeholder List */}
            <div className="p-4 space-y-4 flex-1">
              {[1, 2].map((cardId) => (
                <div 
                  key={cardId}
                  className="bg-surface/10 border border-border-default/20 rounded-lg p-4 flex flex-col h-32"
                >
                  {/* Task ID and tag placeholder */}
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton variant="text" className="h-3.5 w-16" />
                    <div className="flex gap-1">
                      <Skeleton variant="rect" className="h-4.5 w-12 rounded" />
                    </div>
                  </div>
                  
                  {/* Task Name placeholder */}
                  <Skeleton variant="text" className="h-5 w-5/6 mb-4" />
                  
                  {/* Footer metadata placeholder */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-default/10">
                    <Skeleton variant="text" className="h-3 w-20" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton variant="text" className="h-3 w-4" />
                      <Skeleton variant="circle" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
