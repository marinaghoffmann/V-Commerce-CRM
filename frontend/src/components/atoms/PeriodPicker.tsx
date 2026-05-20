import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface PeriodPickerProps {
  startMonth: number;
  startYear:  number;
  endMonth:   number;
  endYear:    number;
  onStartChange: (month: number, year: number) => void;
  onEndChange:   (month: number, year: number) => void;
  minYear?: number;
  maxYear?: number;
}

type ActiveSide = "start" | "end";

export function PeriodPicker({
  startMonth, startYear, endMonth, endYear,
  onStartChange, onEndChange,
  minYear = 2023,
  maxYear = new Date().getFullYear(),
}: PeriodPickerProps) {
  const [open, setOpen]             = useState(false);
  const [activeSide, setActiveSide] = useState<ActiveSide>("start");
  const [navYear, setNavYear]       = useState(startYear);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpenSide(side: ActiveSide) {
    setActiveSide(side);
    setNavYear(side === "start" ? startYear : endYear);
    setOpen(true);
  }

  function handleMonthSelect(mesIndex: number) {
    if (activeSide === "start") {
      onStartChange(mesIndex + 1, navYear);
      setActiveSide("end");
      setNavYear(endYear);
    } else {
      onEndChange(mesIndex + 1, navYear);
      setOpen(false);
    }
  }

  function isSelected(mesIndex: number) {
    if (activeSide === "start") return mesIndex + 1 === startMonth && navYear === startYear;
    return mesIndex + 1 === endMonth && navYear === endYear;
  }

  function isInRange(mesIndex: number) {
    const current = navYear * 100 + (mesIndex + 1);
    const start   = startYear * 100 + startMonth;
    const end     = endYear   * 100 + endMonth;
    return current > start && current < end;
  }

  const formatLabel = (month: number, year: number) =>
    month && year ? `${MESES[month - 1]} ${year}` : "Mês e ano";

  const periodoValido =
    startYear < endYear || (startYear === endYear && startMonth <= endMonth);

  const now = new Date();
  const currentYearNow  = now.getFullYear();
  const currentMonthNow = now.getMonth() + 1;

  return (
    <div ref={ref} className="relative">
      {/* Botão principal */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpenSide("start"))}
        className="flex items-center justify-between gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 transition-colors min-w-[140px]"
      >
        <span>Período</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-[480px]">

          {/* Inputs início e fim */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <p className={`text-xs font-semibold mb-1.5 ${activeSide === "start" ? "text-blue-600" : "text-gray-400"}`}>
                Início
              </p>
              <button
                onClick={() => handleOpenSide("start")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  activeSide === "start"
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{formatLabel(startMonth, startYear)}</span>
                <Calendar size={15} className={activeSide === "start" ? "text-blue-500" : "text-gray-300"} />
              </button>
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold mb-1.5 ${activeSide === "end" ? "text-blue-600" : "text-gray-400"}`}>
                Término
              </p>
              <button
                onClick={() => handleOpenSide("end")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  activeSide === "end"
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{formatLabel(endMonth, endYear)}</span>
                <Calendar size={15} className={activeSide === "end" ? "text-blue-500" : "text-gray-300"} />
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 mb-4" />

          {/* Navegação de ano */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={() => setNavYear((y) => Math.max(minYear, y - 1))}
              disabled={navYear <= minYear}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-gray-800">{navYear}</span>
            <button
              onClick={() => setNavYear((y) => Math.min(maxYear, y + 1))}
              disabled={navYear >= maxYear}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg"
            >
              ›
            </button>
          </div>

          {/* Grid de meses */}
          <div className="grid grid-cols-4 gap-2">
            {MESES.map((m, i) => {
              const selected  = isSelected(i);
              const inRange   = isInRange(i);
              const isFuture  = navYear > currentYearNow ||
                (navYear === currentYearNow && i + 1 > currentMonthNow);
              const isPast    = activeSide === "end" &&
                navYear * 100 + (i + 1) < startYear * 100 + startMonth;
              const disabled  = isFuture || isPast;

              return (
                <button
                  key={m}
                  onClick={() => !disabled && handleMonthSelect(i)}
                  disabled={disabled}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selected
                      ? "bg-blue-600 text-white shadow-sm"
                      : inRange
                      ? "bg-blue-50 text-blue-700"
                      : disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {!periodoValido && (
            <p className="text-xs text-red-500 mt-3 text-center">
              O início não pode ser maior que o término.
            </p>
          )}
        </div>
      )}
    </div>
  );
}