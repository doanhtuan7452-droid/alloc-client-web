export default function BoardColumn({ title, count, dotColor, ActionIcon, children }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10 flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {dotColor && <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>}
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <span className="bg-white/10 border border-white/5 text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {ActionIcon && (
          <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <ActionIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {children}
      </div>
    </div>
  );
}
