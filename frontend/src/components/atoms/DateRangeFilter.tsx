import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export interface DateRange {
  data_inicio: string | null;
  data_fim: string | null;
}

interface DateRangeFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ selected, onChange }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(selected);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleApply = () => {
    // Validação: data_fim não pode ser menor que data_inicio
    if (draft.data_inicio && draft.data_fim && draft.data_fim < draft.data_inicio) {
      alert("A data de término não pode ser anterior à data de início.");
      return;
    }
    onChange(draft);
    setOpen(false);
  };

  const handleClear = () => {
    const cleared: DateRange = { data_inicio: null, data_fim: null };
    setDraft(cleared);
    onChange(cleared);
    setOpen(false);
  };

  const hasSelection = selected.data_inicio !== null || selected.data_fim !== null;
  const displayText = hasSelection
    ? `${selected.data_inicio || "—"} a ${selected.data_fim || "—"}`
    : "Período";

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
        <span className="truncate">{displayText}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
          style={{ width: "400px" }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Selecionar período</h3>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Inputs */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Data Início */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Início</label>
              <input
                type="date"
                value={draft.data_inicio || ""}
                onChange={(e) => setDraft({ ...draft, data_inicio: e.target.value || null })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 cursor-pointer"
                style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
              />
            </div>

            {/* Data Fim */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">Término</label>
              <input
                type="date"
                value={draft.data_fim || ""}
                onChange={(e) => setDraft({ ...draft, data_fim: e.target.value || null })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 cursor-pointer"
                style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Limpar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
