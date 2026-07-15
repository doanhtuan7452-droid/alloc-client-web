import { Droppable } from "@hello-pangea/dnd";

// ĐẢM BẢO có nhận "onAction" ở đây
export default function BoardColumn({ id, title, count, dotColor, ActionIcon, onAction, children }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10 flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {dotColor && <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>}
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <span className="bg-white/10 border border-white/5 text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        
        {/* NÚT BẤM DẤU CỘNG: Đảm bảo có onClick={onAction} */}
        {ActionIcon && (
          <button 
            type="button"
            onClick={onAction} // Gọi hàm openCreateModal từ Board.jsx truyền sang
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ActionIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Vùng thả công việc (Droppable) */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-[150px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-white/[0.02] rounded-b-xl" : ""
            }`}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}