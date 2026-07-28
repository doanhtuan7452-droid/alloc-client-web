import Skeleton from "./Skeleton";

export default function TaskListSkeleton() {
  const rows = [1, 2, 3, 4, 5];

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Table Toolbar Skeleton */}
      <div className="p-4 border-b border-border-default/40 bg-surface/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton variant="rect" className="h-8 w-48 rounded-lg" />
          <Skeleton variant="rect" className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-8 w-32 rounded-lg" />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-default text-xs font-mono text-content-muted uppercase">
              <th className="px-4 py-3 font-semibold w-24">ID</th>
              <th className="px-4 py-3 font-semibold">Tên công việc</th>
              <th className="px-4 py-3 font-semibold w-32">Trạng thái</th>
              <th className="px-4 py-3 font-semibold w-28">Độ ưu tiên</th>
              <th className="px-4 py-3 font-semibold w-40">Người thực hiện</th>
              <th className="px-4 py-3 font-semibold w-36">Ngày đến hạn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {rows.map((rowId) => (
              <tr key={rowId} className="border-b border-border-default/10">
                {/* ID Column */}
                <td className="px-4 py-4.5">
                  <Skeleton variant="text" className="h-4 w-12 font-mono" />
                </td>
                
                {/* Task Name Column */}
                <td className="px-4 py-4.5">
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-4 w-3/4 md:w-1/2" />
                    <Skeleton variant="text" className="h-3 w-24" />
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-4 py-4.5">
                  <Skeleton variant="rect" className="h-5 w-20 rounded-full" />
                </td>

                {/* Priority Column */}
                <td className="px-4 py-4.5">
                  <Skeleton variant="rect" className="h-4.5 w-16 rounded" />
                </td>

                {/* Assignees Column */}
                <td className="px-4 py-4.5">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circle" className="w-6 h-6" />
                    <Skeleton variant="text" className="h-3.5 w-20" />
                  </div>
                </td>

                {/* Due Date Column */}
                <td className="px-4 py-4.5">
                  <Skeleton variant="text" className="h-3.5 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
