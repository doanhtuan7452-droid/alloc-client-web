import Avatar from "./Avatar";

export default function TaskCard({ 
  tags = [], 
  title, 
  description, 
  date, 
  comments, 
  progress, // { label, percent, color }
  assignee, // { initials }
  isActive = false,
  statusText = null, // e.g., "Needs Feedback"
  statusColor = "text-emerald-400",
  opacity = 100
}) {
  return (
    <div className={`bg-black border ${isActive ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-neutral-800'} rounded-lg p-4 relative overflow-hidden flex flex-col ${opacity < 100 ? 'opacity-75' : ''}`}>
      {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {tags.map((tag, idx) => (
            <span key={idx} className={`${tag.bgClass || 'bg-neutral-800'} ${tag.textClass || 'text-neutral-300'} border ${tag.borderClass || 'border-neutral-700'} text-[10px] uppercase font-mono px-2 py-0.5 rounded`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
      
      <h4 className="font-medium mb-2 leading-tight text-white">{title}</h4>
      
      {description && (
        <p className="text-xs text-neutral-400 mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {progress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="text-neutral-400 font-mono">{progress.label}</span>
            <span className={`${progress.color || 'text-cyan-400'} font-mono`}>{progress.percent}%</span>
          </div>
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className={`h-full ${progress.bgClass || 'bg-cyan-400'}`} style={{ width: `${progress.percent}%` }}></div>
          </div>
        </div>
      )}

      <div className="flex items-center text-xs text-neutral-500 gap-4 mt-auto pt-2">
        {date && <span className="flex items-center gap-1">{date}</span>}
        {comments && <span className="flex items-center gap-1">{comments} comments</span>}
        {statusText && <span className={`flex items-center gap-1 ${statusColor}`}>{statusText}</span>}
        
        {assignee && (
          <div className="ml-auto w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] text-white">
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}
