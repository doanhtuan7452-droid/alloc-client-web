// Loading skeleton for Finance view.
// Glassmorphism design system matching the rest of the application.
import Skeleton from "./Skeleton";

export default function FinanceSkeleton() {
  const cards = [1, 2, 3];
  const tableRows = [1, 2, 3];

  return (
    <div className="flex-grow overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      
      {/* 3 Metrics Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((id) => (
          <div key={id} className="bg-surface border border-border-default rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start mb-2">
              <Skeleton variant="rect" className="w-10 h-10 rounded-lg border border-border-default/30" />
            </div>
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-8 w-36" />
            <Skeleton variant="text" className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      {/* Tables placeholders */}
      <div className="space-y-6">
        {/* Table 1 placeholder: Budget Allocations */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border-default/40 space-y-2">
            <Skeleton variant="text" className="h-6 w-40" />
            <Skeleton variant="text" className="h-3.5 w-60" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-5 gap-4 border-b border-border-default/20 pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="text" className="h-4" />
              ))}
            </div>
            {tableRows.map((rowId) => (
              <div key={rowId} className="grid grid-cols-5 gap-4 py-2 border-b border-border-default/10">
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Table 2 placeholder: Expense Records */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border-default/40 space-y-2">
            <Skeleton variant="text" className="h-6 w-36" />
            <Skeleton variant="text" className="h-3.5 w-72" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b border-border-default/20 pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="text" className="h-4" />
              ))}
            </div>
            {tableRows.map((rowId) => (
              <div key={rowId} className="grid grid-cols-6 gap-4 py-2 border-b border-border-default/10">
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
                <Skeleton variant="text" className="h-4 col-span-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
