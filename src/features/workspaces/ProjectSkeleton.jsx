// Loading skeleton for Projects grid.
// Glassmorphism design system matching the rest of the application.

export default function ProjectSkeleton() {
  const cards = [1, 2, 3];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {cards.map((id) => (
        <div 
          key={id} 
          className="bg-surface border border-border-default rounded-xl p-6 flex flex-col min-h-[260px] relative overflow-hidden"
        >
          {/* Accent glow placeholder */}
          <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800"></div>
          
          <div className="flex justify-between items-start mb-5">
            {/* Status pill placeholder */}
            <div className="h-6 w-28 bg-neutral-800 rounded"></div>
            {/* More vertical placeholder */}
            <div className="h-5 w-5 bg-neutral-800 rounded-full"></div>
          </div>
          
          {/* Project ID placeholder */}
          <div className="h-4 w-16 bg-neutral-800 rounded mb-2"></div>
          
          {/* Project Name placeholder */}
          <div className="h-7 w-3/4 bg-neutral-850 bg-neutral-800 rounded mb-4"></div>
          
          {/* Expected budget placeholder */}
          <div className="space-y-3 mt-auto w-full">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-neutral-850 bg-neutral-800 rounded"></div>
              <div className="h-4 w-16 bg-neutral-850 bg-neutral-800 rounded"></div>
            </div>
            
            {/* Progress bar placeholder */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-neutral-850 bg-neutral-800 rounded"></div>
                <div className="h-3 w-8 bg-neutral-850 bg-neutral-800 rounded"></div>
              </div>
              <div className="h-1.5 w-full bg-neutral-850 bg-neutral-800 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
