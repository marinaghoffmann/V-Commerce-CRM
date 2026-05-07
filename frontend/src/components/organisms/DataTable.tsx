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
}

export const DataTable = <T extends object>({
  columns,
  data,
  maxHeight = 400,
  pageSize = 5,
  setPageSize,
}: DataTableProps<T>) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage   = Math.min(page, totalPages);

  const rows = data.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));


  return (

    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden w-[90vw] mx-auto">

      <div style={{ maxHeight }} className="overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-blue-300">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
              <th> 
                <select onChange={(e) => setPageSize(e.target.value)} value={pageSize} className="ml-2 p-1 border rounded"> 
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
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
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
          {data.length === 0
            ? "0 resultados"
            : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, data.length)} de ${data.length}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                p === safePage
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};