interface PageSizeSelectProps {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
}

export function PageSizeSelect({ value, onChange, options = [5, 10, 12, 20, 50] }: PageSizeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="font-bold p-1 border rounded text-sm cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
