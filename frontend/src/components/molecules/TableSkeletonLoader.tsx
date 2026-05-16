import { SkeletonRow } from "../atoms/SkeletonRow";

interface TableSkeletonLoaderProps {
  rowCount?: number;
  cellCount?: number;
  cellWidths?: (string | number)[];
}

export const TableSkeletonLoader = ({
  rowCount = 5,
  cellCount = 9,
  cellWidths,
}: TableSkeletonLoaderProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Skeleton */}
      <div
        className="grid gap-3 p-4 border-b border-gray-100 bg-gray-50"
        style={{
          gridTemplateColumns: Array.isArray(cellWidths)
            ? cellWidths.map((w) => (typeof w === "number" ? `${w}px` : w)).join(" ")
            : `repeat(${cellCount}, 1fr)`,
        }}
      >
        {Array(cellCount).fill(null).map((_, idx) => (
          <div key={idx} className="flex items-center">
            <div className="w-full h-4 bg-gray-300 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Rows Skeleton */}
      {Array(rowCount).fill(null).map((_, idx) => (
        <SkeletonRow
          key={idx}
          cellCount={cellCount}
          cellWidths={cellWidths}
        />
      ))}
    </div>
  );
};
