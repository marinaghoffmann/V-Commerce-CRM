interface SkeletonRowProps {
  cellCount?: number;
  cellWidths?: (string | number)[];
}

export const SkeletonRow = ({ cellCount = 9, cellWidths }: SkeletonRowProps) => {
  const defaultWidths = cellWidths || Array(cellCount).fill("1fr");

  return (
    <div
      className="grid gap-3 p-4 border-b border-gray-100"
      style={{
        gridTemplateColumns: Array.isArray(defaultWidths)
          ? defaultWidths.map((w) => (typeof w === "number" ? `${w}px` : w)).join(" ")
          : `repeat(${cellCount}, 1fr)`,
      }}
    >
      {Array(cellCount).fill(null).map((_, idx) => (
        <div key={idx} className="flex items-center">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};
