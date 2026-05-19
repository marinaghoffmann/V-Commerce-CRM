// components/organisms/DataTable.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: never, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: number;
  pageSize?: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  page?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
}

export const DataTable = <T extends object>({
  columns,
  data,
  maxHeight = 400,
  pageSize = 5,
  setPageSize,
  page: externalPage,
  onPageChange,
  totalItems,
}: DataTableProps<T>) => {
  const [internalPage, setInternalPage] = useState(1);

  const isControlled = externalPage !== undefined && onPageChange !== undefined;
  const page = isControlled ? externalPage : internalPage;
  const total = totalItems ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = isControlled ? externalPage : Math.min(page, totalPages);
  const rows = isControlled ? data : data.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goTo = (p: number) => {
    const next = Math.max(1, p);
    if (isControlled) {
      onPageChange(next);
    } else {
      setInternalPage(Math.min(next, totalPages));
    }
  };

  return (

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <div style={{ maxHeight }} className="overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-blue-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-tight whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-2 py-3 text-right">
                <select onChange={(e) => setPageSize(Number(e.target.value))} value={pageSize} className="p-1 border rounded text-xs text-gray-600 bg-white cursor-pointer">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 last:border-b-0 hover:bg-blue-50/40 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-3 text-sm text-gray-700">
                    {col.render
                      ? col.render((row as Record<string, never>)[col.key], row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-400 text-sm"
                >
                  Nenhum resultado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {total === 0
            ? "0 resultados"
            : `Mostrando ${String((safePage - 1) * pageSize + 1).padStart(2, "0")} a ${String(Math.min(safePage * pageSize, total)).padStart(2, "0")} de ${String(total).padStart(2, "0")} resultados`}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
            return start + i;
          }).map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={[
                "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
                safePage === n
                  ? "border-2 border-blue-500 text-blue-600 bg-white"
                  : "text-gray-400 hover:bg-gray-100",
              ].join(" ")}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goTo(safePage + 1)}
            disabled={isControlled ? data.length < pageSize : safePage >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};