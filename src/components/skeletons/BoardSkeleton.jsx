// Loading skeleton for Kanban Board.
// Glassmorphism design system matching the rest of the application.

export default function BoardSkeleton() {
  const columns = [
    { title: "To Do", dotColor: "bg-neutral-800" },
    { title: "In Progress", dotColor: "bg-cyan-500/30" },
    { title: "Review", dotColor: "bg-amber-500/30" },
    { title: "Done", dotColor: "bg-emerald-500/30" }
  ];

  return (
    <div className="flex-grow p-4 md:p-6 h-full flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start flex-1 overflow-y-auto custom-scrollbar pr-1 animate-pulse">
        {columns.map((col, idx) => (
          <div key={idx} className="bg-white/[0.03] rounded-xl border border-white/10 flex flex-col min-h-[400px]">
            {/* Column Header Placeholder */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                <div className="h-5 w-20 bg-neutral-800 rounded"></div>
                <div className="h-4 w-6 bg-neutral-850 bg-neutral-800 rounded-full"></div>
              </div>
            </div>

            {/* Cards Placeholder List */}
            <div className="p-4 space-y-4 flex-1">
              {[1, 2].map((cardId) => (
                <div 
                  key={cardId}
                  className="bg-white/[0.01] border border-white/5 rounded-lg p-4 flex flex-col h-32"
                >
                  {/* Task ID and tag placeholder */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-3.5 w-16 bg-neutral-850 bg-neutral-800 rounded"></div>
                    <div className="flex gap-1">
                      <div className="h-4 w-12 bg-neutral-850 bg-neutral-800 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Task Name placeholder */}
                  <div className="h-5 w-5/6 bg-neutral-850 bg-neutral-800 rounded mb-4"></div>
                  
                  {/* Footer metadata placeholder */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <div className="h-3 w-20 bg-neutral-850 bg-neutral-800 rounded"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-4 bg-neutral-850 bg-neutral-800 rounded"></div>
                      <div className="w-5 h-5 rounded-full bg-neutral-850 bg-neutral-800"></div>
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
