import Skeleton from "./Skeleton";

export default function ConversationsSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-[#0B0B0C] text-slate-100 overflow-hidden">
      
      {/* SIDEBAR TRÁI SKELETON: DANH SÁCH PHÒNG CHAT */}
      <div className="w-80 border-r border-border-default/40 flex flex-col bg-surface/10 shrink-0">
        
        {/* Header tìm kiếm & Title placeholder */}
        <div className="p-4 border-b border-border-default/20 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="h-5 w-28" />
            <Skeleton variant="rect" className="w-7 h-7 rounded-lg" />
          </div>
          <Skeleton variant="rect" className="w-full h-8 rounded-lg" />
        </div>

        {/* Các Tab Phân loại phòng */}
        <div className="flex border-b border-border-default/20 px-2 bg-base/20 shrink-0 py-2.5 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" className="flex-1 h-5 rounded" />
          ))}
        </div>

        {/* Khung chứa danh sách phòng chat skeleton */}
        <div className="flex-grow overflow-y-auto p-2 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-transparent bg-surface/20 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar */}
                <Skeleton variant="rect" className="w-9 h-9 rounded-xl" />

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton variant="text" className="h-3.5 w-2/3" />
                  <Skeleton variant="text" className="h-3 w-5/6" />
                </div>
              </div>
              <Skeleton variant="text" className="h-2 w-8 self-start mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* KHUNG CHAT CHI TIẾT SKELETON BÊN PHẢI */}
      <div className="flex-1 flex flex-col bg-base overflow-hidden relative">
        
        {/* Header Khung Chat */}
        <div className="h-16 border-b border-border-default/30 px-6 flex items-center justify-between bg-surface/10 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="w-10 h-10 border border-border-default/30" />
            <div className="space-y-1.5">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="rect" className="w-8 h-8 rounded-lg" />
            <Skeleton variant="rect" className="w-8 h-8 rounded-lg" />
          </div>
        </div>

        {/* Danh sách tin nhắn dummy skeleton (Xen kẽ trái phải) */}
        <div className="flex-grow p-6 space-y-6 overflow-y-auto flex flex-col justify-end">
          
          {/* Tin nhắn bên trái */}
          <div className="flex gap-3 max-w-lg mr-auto">
            <Skeleton variant="circle" className="w-8 h-8 self-end" />
            <div className="p-3.5 rounded-2xl bg-surface/40 border border-border-default/30 space-y-2 min-w-[200px]">
              <Skeleton variant="text" className="h-3.5 w-full" />
              <Skeleton variant="text" className="h-3.5 w-5/6" />
            </div>
          </div>

          {/* Tin nhắn bên phải */}
          <div className="flex gap-3 max-w-lg ml-auto justify-end">
            <div className="p-3.5 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 space-y-2 min-w-[200px] text-right">
              <Skeleton variant="text" className="h-3.5 w-full bg-accent-primary/10" />
              <Skeleton variant="text" className="h-3.5 w-2/3 bg-accent-primary/10" />
            </div>
            <Skeleton variant="circle" className="w-8 h-8 self-end" />
          </div>

          {/* Tin nhắn bên trái */}
          <div className="flex gap-3 max-w-lg mr-auto">
            <Skeleton variant="circle" className="w-8 h-8 self-end" />
            <div className="p-3.5 rounded-2xl bg-surface/40 border border-border-default/30 space-y-2 min-w-[250px]">
              <Skeleton variant="text" className="h-3.5 w-full" />
              <Skeleton variant="text" className="h-3.5 w-full" />
              <Skeleton variant="text" className="h-3.5 w-1/2" />
            </div>
          </div>

          {/* Tin nhắn bên phải */}
          <div className="flex gap-3 max-w-lg ml-auto justify-end">
            <div className="p-3.5 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 space-y-2 min-w-[150px]">
              <Skeleton variant="text" className="h-3.5 w-5/6 bg-accent-primary/10" />
            </div>
            <Skeleton variant="circle" className="w-8 h-8 self-end" />
          </div>

        </div>

        {/* Input bar ở đáy skeleton */}
        <div className="p-4 bg-surface/5 border-t border-border-default/30 shrink-0">
          <Skeleton variant="rect" className="h-11 w-full rounded-xl" />
        </div>

      </div>

    </div>
  );
}
