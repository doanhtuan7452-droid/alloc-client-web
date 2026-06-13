export default function Avatar({ src, alt = "Avatar", size = "w-8 h-8", outline = false, status = null }) {
  return (
    <div className={`relative ${size}`}>
      <div className={`w-full h-full rounded-full bg-slate-700 overflow-hidden ${outline ? "border-2 border-border-default" : ""}`}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-content-muted font-medium">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {status && (
        <span 
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${
            status === 'online' ? 'bg-green-500' :
            status === 'offline' ? 'bg-slate-500' :
            status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
          }`}
        ></span>
      )}
    </div>
  );
}
