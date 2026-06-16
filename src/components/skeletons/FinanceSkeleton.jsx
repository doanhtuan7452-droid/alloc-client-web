// Loading skeleton for Finance view.
// Glassmorphism design system matching the rest of the application.

export default function FinanceSkeleton() {
  const cards = [1, 2, 3];
  const tableRows = [1, 2, 3];

  return (
    <div className="flex-grow overflow-y-auto h-full p-4 md:p-6 custom-scrollbar animate-pulse">
      
      {/* 3 Metrics Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((id) => (
          <div key={id} className="bg-surface border border-border-default rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/5"></div>
            </div>
            <div className="h-4 w-20 bg-neutral-800 rounded mb-2"></div>
            <div className="h-8 w-36 bg-neutral-800 rounded mb-4"></div>
            <div className="h-3.5 w-24 bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Tables placeholders */}
      <div className="space-y-6">
        {/* Table 1 placeholder: Budget Allocations */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border-default">
            <div className="h-6 w-40 bg-neutral-800 rounded mb-2"></div>
            <div className="h-3 w-60 bg-neutral-800 rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-5 gap-4 border-b border-white/5 pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-neutral-800 rounded"></div>
              ))}
            </div>
            {tableRows.map((rowId) => (
              <div key={rowId} className="grid grid-cols-5 gap-4 py-2">
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2 placeholder: Expense Records */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border-default">
            <div className="h-6 w-36 bg-neutral-800 rounded mb-2"></div>
            <div className="h-3 w-72 bg-neutral-800 rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b border-white/5 pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 bg-neutral-800 rounded"></div>
              ))}
            </div>
            {tableRows.map((rowId) => (
              <div key={rowId} className="grid grid-cols-6 gap-4 py-2">
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
                <div className="h-4 bg-neutral-800 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
