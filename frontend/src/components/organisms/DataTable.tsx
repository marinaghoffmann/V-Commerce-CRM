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
  const page       = isControlled ? externalPage : internalPage;
  const total      = totalItems ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage   = isControlled ? externalPage : Math.min(page, totalPages);
  const rows       = isControlled ? data : data.slice((safePage - 1) * pageSize, safePage * pageSize);

const goTo = (p: number) => {
  const next = Math.max(1, p);
  if (isControlled) {
    onPageChange(next);
  } else {
    setInternalPage(Math.min(next, totalPages));
  }
};

  return (

    <div className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden w-[95vw] mx-auto">

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
                <select onChange={(e) => setPageSize(Number(e.target.value))} value={pageSize} className="mr-2 p-1 border rounded"> 
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
        {total === 0
        ? "0 resultados"
        : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, total)} de ${total}`}
      </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
          <ChevronLeft size={16} />
        </button>

        <span className="w-7 h-7 rounded-lg text-xs font-medium bg-blue-600 text-white flex items-center justify-center">
        {safePage}
        </span>

        <button
          onClick={() => goTo(safePage + 1)}
          disabled={isControlled ? data.length < pageSize : safePage === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
        <ChevronRight size={16} />
        </button>
        </div>
      </div>
    </div>
  );
};