// Loading skeleton for Projects grid.
// Glassmorphism design system matching the rest of the application.
import Skeleton from "../../components/skeletons/Skeleton";

export default function ProjectSkeleton() {
  const cards = [1, 2, 3];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((id) => (
        <div 
          key={id} 
          className="bg-surface border border-border-default rounded-xl p-6 flex flex-col min-h-[260px] relative overflow-hidden"
        >
          {/* Accent glow placeholder */}
          <div className="absolute top-0 left-0 w-full h-1 bg-border-default/30"></div>
          
          <div className="flex justify-between items-start mb-5">
            {/* Status pill placeholder */}
            <Skeleton variant="rect" className="h-6 w-28 rounded" />
            {/* More vertical placeholder */}
            <Skeleton variant="circle" className="h-5 w-5" />
          </div>
          
          {/* Project ID placeholder */}
          <Skeleton variant="text" className="h-4 w-16 mb-2" />
          
          {/* Project Name placeholder */}
          <Skeleton variant="text" className="h-7 w-3/4 mb-4" />
          
          {/* Expected budget placeholder */}
          <div className="space-y-3 mt-auto w-full">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
            
            {/* Progress bar placeholder */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton variant="text" className="h-3 w-16" />
                <Skeleton variant="text" className="h-3 w-8" />
              </div>
              <Skeleton variant="rect" className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
