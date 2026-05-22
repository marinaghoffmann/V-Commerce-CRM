import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface OptionColor {
  bg: string;
  border: string;
  text: string;
}

interface DropdownFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  optionColors?: Record<string, OptionColor>;
}

export const DropdownFilter = ({
  label,
  options,
  selected,
  onChange,
  optionColors,
}: DropdownFilterProps) => {
  const getColor = (option: string): OptionColor | undefined => {
    if (!optionColors) return undefined;
    return optionColors[option] ?? optionColors[option.toLowerCase()] ?? optionColors[option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()];
  };
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
          "flex items-center justify-between gap-2 rounded-full border text-sm font-medium transition-all shadow-sm whitespace-nowrap cursor-pointer select-none w-48",
          hasSelection
            ? "border-blue-500 bg-blue-500 text-white pl-2 pr-4 py-2.5 hover:bg-blue-600 hover:border-blue-600"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 px-4 py-2.5",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          {hasSelection && (
            <>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-blue-400 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="w-px h-5 bg-white/40" />
            </>
          )}
          <span>{label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${hasSelection ? "text-white" : ""} ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl min-w-47.5 py-2 overflow-hidden">
          {options.length === 0 ? (
            <p className="px-4 py-2 text-xs text-gray-400">Sem opções</p>
          ) : (
            <div className={optionColors ? "flex flex-col gap-1 max-h-64 overflow-y-auto px-1" : ""}>
              {options.map((option) => {
                const isSelected = selected.includes(option);
                const color = getColor(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${
                      optionColors ? "rounded-xl px-3 py-2" : ""
                    }`}
                  >
                    <span
                      className={[
                        "shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 bg-white",
                      ].join(" ")}
                    >
                      {isSelected && (
                        <Check size={12} className="text-white" strokeWidth={3} />
                      )}
                    </span>
                    {color ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${color.bg} ${color.border} ${color.text}`}
                      >
                        {option}
                      </span>
                    ) : (
                      <span className="capitalize leading-tight">{option}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};