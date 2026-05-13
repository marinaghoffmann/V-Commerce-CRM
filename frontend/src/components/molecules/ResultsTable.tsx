interface ResultsTableProps {
  rows: unknown[];
}

export function ResultsTable({ rows }: ResultsTableProps) {
  const getTableColumns = (rows: unknown[]) => {
    const firstRow = rows[0];
    if (!firstRow || typeof firstRow !== "object") {
      return [] as string[];
    }
    return Object.keys(firstRow as Record<string, unknown>);
  };

  const formatCellValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "-";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const columns = getTableColumns(rows);

  return (
    <div className="rounded-lg border border-gray-300 bg-white text-gray-800">
      <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {rows.length} resultado(s)
      </div>
      <div className="max-h-56 w-full overflow-auto">
        <table className="min-w-max w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-600"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const typedRow = row as Record<string, unknown>;
              return (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="whitespace-nowrap border-b border-gray-100 px-3 py-2 align-top text-gray-700"
                    >
                      {formatCellValue(typedRow[column])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
