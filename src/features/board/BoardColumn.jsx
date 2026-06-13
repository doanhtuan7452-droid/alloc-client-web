export default function BoardColumn({ title, count, dotColor, ActionIcon, children }) {
  return (
    <div className="bg-header rounded-xl border border-border-default flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-border-default flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {dotColor && <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>}
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded">
            {count}
          </span>
        </div>
        {ActionIcon && (
          <button className="text-neutral-500 hover:text-white transition-colors">
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {children}
      </div>
    </div>
  );
}
