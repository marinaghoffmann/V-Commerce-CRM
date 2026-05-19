import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";

export interface PeriodoSelecionado {
  mes: number;
  ano: number;
}

interface PeriodoFilterProps {
  options: PeriodoSelecionado[];
  selected: PeriodoSelecionado[];
  onChange: (selected: PeriodoSelecionado[]) => void;
}

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function samePeriodo(a: PeriodoSelecionado, b: PeriodoSelecionado) {
  return a.mes === b.mes && a.ano === b.ano;
}

function periodoKey(p: PeriodoSelecionado) {
  return `${p.ano}-${String(p.mes).padStart(2, "0")}`;
}

function periodoLabel(p: PeriodoSelecionado) {
  return `${MESES[p.mes - 1]}/${p.ano}`;
}

export const PeriodoFilter = ({ options, selected, onChange }: PeriodoFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const anos = Array.from(new Set(options.map((o) => o.ano))).sort((a, b) => b - a);
  const [viewAno, setViewAno] = useState<number>(() => anos[0] ?? new Date().getFullYear());

  useEffect(() => {
    if (anos.length > 0 && !anos.includes(viewAno)) setViewAno(anos[0]);
  }, [anos.join(",")]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePeriodo = (p: PeriodoSelecionado) => {
    const exists = selected.some((s) => samePeriodo(s, p));
    if (exists) onChange(selected.filter((s) => !samePeriodo(s, p)));
    else onChange([...selected, p]);
  };

  const mesesDoAno = options.filter((o) => o.ano === viewAno).map((o) => o.mes);
  const hasSelection = selected.length > 0;
  const prevAnoIdx = anos.indexOf(viewAno) + 1;
  const nextAnoIdx = anos.indexOf(viewAno) - 1;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all shadow-sm whitespace-nowrap cursor-pointer select-none",
          hasSelection
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
        ].join(" ")}
      >
        <span>Período</span>
        {hasSelection && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold leading-none">
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl w-64 overflow-hidden">

          {/* Navegação de ano */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => prevAnoIdx < anos.length && setViewAno(anos[prevAnoIdx])}
              disabled={prevAnoIdx >= anos.length}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-gray-800">{viewAno}</span>
            <button
              onClick={() => nextAnoIdx >= 0 && setViewAno(anos[nextAnoIdx])}
              disabled={nextAnoIdx < 0}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Grid de meses */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {MESES.map((label, idx) => {
              const mes = idx + 1;
              const periodo: PeriodoSelecionado = { mes, ano: viewAno };
              const disponivel = mesesDoAno.includes(mes);
              const isSelected = selected.some((s) => samePeriodo(s, periodo));

              return (
                <button
                  key={mes}
                  onClick={() => disponivel && togglePeriodo(periodo)}
                  disabled={!disponivel}
                  className={[
                    "flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all",
                    !disponivel
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-500 text-white shadow-sm cursor-pointer"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer",
                  ].join(" ")}
                >
                  {isSelected && disponivel && (
                    <Check size={9} strokeWidth={3.5} className="flex-shrink-0" />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Chips das seleções + limpar */}
          {hasSelection && (
            <div className="border-t border-gray-100 px-3 py-2.5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[...selected]
                  .sort((a, b) => periodoKey(a).localeCompare(periodoKey(b)))
                  .map((p) => (
                    <span
                      key={periodoKey(p)}
                      onClick={() => togglePeriodo(p)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                    >
                      {periodoLabel(p)}
                      <span className="text-blue-400 leading-none">×</span>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
