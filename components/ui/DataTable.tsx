import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonRows?: number;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({ columns, data, isLoading, emptyMessage = "No data found.", skeletonRows = 6 }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap", col.width)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            : data.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )
            : data.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-5 py-3.5", col.width)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
