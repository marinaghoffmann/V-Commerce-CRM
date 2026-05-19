import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const DropdownFilter = ({
  label,
  options,
  selected,
  onChange,
}: DropdownFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex items-center justify-between gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all shadow-sm whitespace-nowrap cursor-pointer select-none w-48",
          hasSelection
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {hasSelection && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold leading-none">
              {selected.length}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl min-w-[190px] py-2 overflow-hidden">
          {options.length === 0 ? (
            <p className="px-4 py-2 text-xs text-gray-400">Sem opções</p>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggle(option)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <span
                    className={[
                      "flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <Check size={9} className="text-white" strokeWidth={3.5} />
                    )}
                  </span>
                  <span className="capitalize leading-tight">{option}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};