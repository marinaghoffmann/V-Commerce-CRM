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
  // comparação
  compStartMonth?: number;
  compStartYear?:  number;
  compEndMonth?:   number;
  compEndYear?:    number;
  onCompStartChange?: (month: number, year: number) => void;
  onCompEndChange?:   (month: number, year: number) => void;
  onCompToggle?: (enabled: boolean) => void;
  compEnabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

type ActiveSide   = "start" | "end";
type ActivePeriod = "main" | "comp";

export function PeriodPicker({
  startMonth, startYear, endMonth, endYear,
  onStartChange, onEndChange,
  compStartMonth, compStartYear, compEndMonth, compEndYear,
  onCompStartChange, onCompEndChange,
  onCompToggle, compEnabled = false,
  minYear = 2023,
  maxYear = new Date().getFullYear(),
}: PeriodPickerProps) {
  const [open, setOpen]               = useState(false);
  const [activeSide, setActiveSide]   = useState<ActiveSide>("start");
  const [activePeriod, setActivePeriod] = useState<ActivePeriod>("main");
  const [navYear, setNavYear]         = useState(startYear);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpenSide(side: ActiveSide, period: ActivePeriod = "main") {
    setActiveSide(side);
    setActivePeriod(period);
    if (period === "main") {
      setNavYear(side === "start" ? startYear : endYear);
    } else {
      setNavYear(side === "start" ? (compStartYear ?? startYear - 1) : (compEndYear ?? endYear - 1));
    }
    setOpen(true);
  }

  function handleMonthSelect(mesIndex: number) {
    const isMain = activePeriod === "main";

    if (activeSide === "start") {
      if (isMain) onStartChange(mesIndex + 1, navYear);
      else onCompStartChange?.(mesIndex + 1, navYear);
      setActiveSide("end");
      if (isMain) setNavYear(endYear);
      else setNavYear(compEndYear ?? endYear - 1);
    } else {
      if (isMain) onEndChange(mesIndex + 1, navYear);
      else onCompEndChange?.(mesIndex + 1, navYear);
      setOpen(false);
    }
  }

  function isSelected(mesIndex: number) {
    if (activePeriod === "main") {
      if (activeSide === "start") return mesIndex + 1 === startMonth && navYear === startYear;
      return mesIndex + 1 === endMonth && navYear === endYear;
    } else {
      if (activeSide === "start") return mesIndex + 1 === compStartMonth && navYear === compStartYear;
      return mesIndex + 1 === compEndMonth && navYear === compEndYear;
    }
  }

  function isInRange(mesIndex: number) {
    const current = navYear * 100 + (mesIndex + 1);
    if (activePeriod === "main") {
      return current > startYear * 100 + startMonth && current < endYear * 100 + endMonth;
    } else {
      const cs = (compStartYear ?? 0) * 100 + (compStartMonth ?? 0);
      const ce = (compEndYear   ?? 0) * 100 + (compEndMonth   ?? 0);
      return current > cs && current < ce;
    }
  }

  const formatLabel = (month?: number, year?: number) =>
    month && year ? `${MESES[month - 1]} ${year}` : "Mês e ano";

  const periodoValido =
    startYear < endYear || (startYear === endYear && startMonth <= endMonth);

  const compPeriodoValido = !compEnabled ||
    ((compStartYear ?? 0) < (compEndYear ?? 0) ||
     ((compStartYear ?? 0) === (compEndYear ?? 0) && (compStartMonth ?? 0) <= (compEndMonth ?? 0)));

const mainMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
const compMonths = compEnabled
  ? ((compEndYear ?? 0) - (compStartYear ?? 0)) * 12 + ((compEndMonth ?? 0) - (compStartMonth ?? 0))
  : 0;

const compTamanhosDiferentes = compEnabled && mainMonths !== compMonths;

  const now = new Date();
  const currentYearNow  = now.getFullYear();
  const currentMonthNow = now.getMonth() + 1;

  // determina o "start" do período ativo para bloquear datas anteriores no "end"
  const activeStartVal = activePeriod === "main"
    ? startYear * 100 + startMonth
    : (compStartYear ?? 0) * 100 + (compStartMonth ?? 0);

  return (
    <div ref={ref} className="relative">
      {/* Botão principal */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpenSide("start", "main"))}
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

          {/* ── Período principal ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Período principal</p>
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "main" && activeSide === "start" ? "text-blue-600" : "text-gray-400"}`}>
                Início
              </p>
              <button
                onClick={() => handleOpenSide("start", "main")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  activePeriod === "main" && activeSide === "start"
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{formatLabel(startMonth, startYear)}</span>
                <Calendar size={15} className={activePeriod === "main" && activeSide === "start" ? "text-blue-500" : "text-gray-300"} />
              </button>
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "main" && activeSide === "end" ? "text-blue-600" : "text-gray-400"}`}>
                Término
              </p>
              <button
                onClick={() => handleOpenSide("end", "main")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  activePeriod === "main" && activeSide === "end"
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{formatLabel(endMonth, endYear)}</span>
                <Calendar size={15} className={activePeriod === "main" && activeSide === "end" ? "text-blue-500" : "text-gray-300"} />
              </button>
            </div>
          </div>

          {/* ── Toggle comparação ── */}
          <div className="flex items-center justify-between py-3 px-1 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Comparação</span>
            <button
              onClick={() => onCompToggle?.(!compEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                compEnabled ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  compEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* ── Período de comparação ── */}
          {compEnabled && (
            <div className="flex gap-3 mt-3 mb-5">
              <div className="flex-1">
                <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "comp" && activeSide === "start" ? "text-purple-600" : "text-gray-400"}`}>
                  Início (comparação)
                </p>
                <button
                  onClick={() => handleOpenSide("start", "comp")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    activePeriod === "comp" && activeSide === "start"
                      ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{formatLabel(compStartMonth, compStartYear)}</span>
                  <Calendar size={15} className={activePeriod === "comp" && activeSide === "start" ? "text-purple-500" : "text-gray-300"} />
                </button>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "comp" && activeSide === "end" ? "text-purple-600" : "text-gray-400"}`}>
                  Término (comparação)
                </p>
                <button
                  onClick={() => handleOpenSide("end", "comp")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    activePeriod === "comp" && activeSide === "end"
                      ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{formatLabel(compEndMonth, compEndYear)}</span>
                  <Calendar size={15} className={activePeriod === "comp" && activeSide === "end" ? "text-purple-500" : "text-gray-300"} />
                </button>
              </div>
            </div>
          )}

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
              const selected = isSelected(i);
              const inRange  = isInRange(i);
              const isFuture = navYear > currentYearNow ||
                (navYear === currentYearNow && i + 1 > currentMonthNow);
              const isPast = activeSide === "end" &&
                navYear * 100 + (i + 1) < activeStartVal;
              const disabled = isFuture || isPast;

              const selectedColor = activePeriod === "comp"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm";
              const rangeColor = activePeriod === "comp"
                ? "bg-purple-50 text-purple-700"
                : "bg-blue-50 text-blue-700";

              return (
                <button
                  key={m}
                  onClick={() => !disabled && handleMonthSelect(i)}
                  disabled={disabled}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selected  ? selectedColor :
                    inRange   ? rangeColor :
                    disabled  ? "text-gray-300 cursor-not-allowed" :
                    "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 mt-3">
            {(!periodoValido || !compPeriodoValido) && (
              <p className="text-xs text-red-500 text-center">
               O início não pode ser maior que o término.
              </p>
            )}
            {compTamanhosDiferentes && (
              <p className="text-xs text-amber-500 text-center">
               O período de comparação deve ter a mesma duração do período principal ({mainMonths + 1} {mainMonths === 0 ? "mês" : "meses"}).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}