import { useState, useRef, useEffect } from "react";
import { Calendar, Check, X } from "lucide-react";

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
type MY = { month: number; year: number };

export function PeriodPicker({
  startMonth, startYear, endMonth, endYear,
  onStartChange, onEndChange,
  compStartMonth, compStartYear, compEndMonth, compEndYear,
  onCompStartChange, onCompEndChange,
  onCompToggle, compEnabled = false,
  minYear = 2023,
  maxYear = new Date().getFullYear(),
}: PeriodPickerProps) {
  const [open, setOpen] = useState(false);

  // Calcula a data sugerida para comparação, evitando datas sem dados (antes de minYear)
  const getComparisonDate = (year: number) => {
    const suggestedYear = year - 1;
    return suggestedYear < minYear ? year + 1 : suggestedYear;
  };

  // --- Draft state — só vai pro pai quando clicar em "Aplicar" ---
  const [dStart, setDStart]               = useState<MY>({ month: startMonth, year: startYear });
  const [dEnd,   setDEnd]                 = useState<MY>({ month: endMonth,   year: endYear   });
  const [dCompEnabled, setDCompEnabled]   = useState(compEnabled);
  const [dCompStart, setDCompStart]       = useState<MY>({
    month: compStartMonth ?? startMonth,
    year:  compStartYear  ?? getComparisonDate(startYear),
  });
  const [dCompEnd, setDCompEnd]           = useState<MY>({
    month: compEndMonth ?? endMonth,
    year:  compEndYear  ?? getComparisonDate(endYear),
  });

  const [activeSide,   setActiveSide]   = useState<ActiveSide>("start");
  const [activePeriod, setActivePeriod] = useState<ActivePeriod>("main");
  const [navYear, setNavYear]           = useState(startYear);
  const ref = useRef<HTMLDivElement>(null);

  // Sempre que abrir, sincroniza o draft com o estado real
  useEffect(() => {
    if (!open) return;
    setDStart({ month: startMonth, year: startYear });
    setDEnd({   month: endMonth,   year: endYear   });
    setDCompEnabled(compEnabled);
    setDCompStart({
      month: compStartMonth ?? startMonth,
      year:  compStartYear  ?? getComparisonDate(startYear),
    });
    setDCompEnd({
      month: compEndMonth ?? endMonth,
      year:  compEndYear  ?? getComparisonDate(endYear),
    });
    setActiveSide("start");
    setActivePeriod("main");
    setNavYear(startYear);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (period === "main") setNavYear(side === "start" ? dStart.year : dEnd.year);
    else                   setNavYear(side === "start" ? dCompStart.year : dCompEnd.year);
    setOpen(true);
  }

  function handleToggleComp() {
    const next = !dCompEnabled;
    setDCompEnabled(next);
    if (next) {
      // Ao ligar, recalcula as datas de comparação com base no período principal atual
      setDCompStart({ month: dStart.month, year: getComparisonDate(dStart.year) });
      setDCompEnd({   month: dEnd.month,   year: getComparisonDate(dEnd.year)   });
    }
    if (!next && activePeriod === "comp") {
      setActivePeriod("main");
      setActiveSide("start");
    }
  }

  function handleMonthSelect(mesIndex: number) {
    const value: MY = { month: mesIndex + 1, year: navYear };
    const isMain   = activePeriod === "main";

    if (activeSide === "start") {
      if (isMain) setDStart(value);
      else        setDCompStart(value);
      setActiveSide("end");
      setNavYear(isMain ? dEnd.year : dCompEnd.year);
      return;
    }

    // selecionou "end"
    if (isMain) {
      setDEnd(value);
      // Se comparação está ativa, avança automaticamente para o início da comparação
      if (dCompEnabled) {
        setActivePeriod("comp");
        setActiveSide("start");
        setNavYear(dCompStart.year);
      }
      // Se não está ativa, fica aqui — usuário clica em "Aplicar"
    } else {
      setDCompEnd(value);
      // Fica aqui — usuário clica em "Aplicar"
    }
  }

  function isSelected(mesIndex: number) {
    if (activePeriod === "main") {
      if (activeSide === "start") return mesIndex + 1 === dStart.month && navYear === dStart.year;
      return mesIndex + 1 === dEnd.month && navYear === dEnd.year;
    }
    if (activeSide === "start") return mesIndex + 1 === dCompStart.month && navYear === dCompStart.year;
    return mesIndex + 1 === dCompEnd.month && navYear === dCompEnd.year;
  }

  function isInRange(mesIndex: number) {
    const current = navYear * 100 + (mesIndex + 1);
    if (activePeriod === "main") {
      return current > dStart.year * 100 + dStart.month && current < dEnd.year * 100 + dEnd.month;
    }
    const cs = dCompStart.year * 100 + dCompStart.month;
    const ce = dCompEnd.year   * 100 + dCompEnd.month;
    return current > cs && current < ce;
  }

  const formatLabel = (month?: number, year?: number) =>
    month && year ? `${MESES[month - 1]} ${year}` : "Mês e ano";

  const periodoValido =
    dStart.year < dEnd.year || (dStart.year === dEnd.year && dStart.month <= dEnd.month);

  const compPeriodoValido = !dCompEnabled ||
    (dCompStart.year < dCompEnd.year ||
     (dCompStart.year === dCompEnd.year && dCompStart.month <= dCompEnd.month));

  const mainMonths = (dEnd.year - dStart.year) * 12 + (dEnd.month - dStart.month);
  const compMonths = dCompEnabled
    ? (dCompEnd.year - dCompStart.year) * 12 + (dCompEnd.month - dCompStart.month)
    : 0;
  const compTamanhosDiferentes = dCompEnabled && mainMonths !== compMonths;

  const canApply = periodoValido && compPeriodoValido && !compTamanhosDiferentes;

  // Detecta se o draft difere do estado aplicado (pra mudar o label do botão Cancelar pra "Fechar" se nada mudou)
  const hasUnsavedChanges =
    dStart.month !== startMonth || dStart.year !== startYear ||
    dEnd.month   !== endMonth   || dEnd.year   !== endYear   ||
    dCompEnabled !== compEnabled ||
    (dCompEnabled && (
      dCompStart.month !== compStartMonth || dCompStart.year !== compStartYear ||
      dCompEnd.month   !== compEndMonth   || dCompEnd.year   !== compEndYear
    ));

  function handleApply() {
    if (!canApply) return;
    onStartChange(dStart.month, dStart.year);
    onEndChange(dEnd.month, dEnd.year);
    if (dCompEnabled !== compEnabled) onCompToggle?.(dCompEnabled);
    if (dCompEnabled) {
      onCompStartChange?.(dCompStart.month, dCompStart.year);
      onCompEndChange?.(dCompEnd.month,     dCompEnd.year);
    }
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  const now              = new Date();
  const currentYearNow   = now.getFullYear();
  const currentMonthNow  = now.getMonth() + 1;

  // limite inferior do "end" — não permitir mês menor que o "start" do mesmo período
  const activeStartVal = activePeriod === "main"
    ? dStart.year * 100 + dStart.month
    : dCompStart.year * 100 + dCompStart.month;

  // Texto-guia mostrando o passo atual
  const stepHint = (() => {
    if (activePeriod === "main" && activeSide === "start") return "1. Escolha o início do período";
    if (activePeriod === "main" && activeSide === "end")   return "2. Escolha o término do período";
    if (activePeriod === "comp" && activeSide === "start") return "3. Escolha o início da comparação";
    return "4. Escolha o término da comparação";
  })();

  return (
    <div ref={ref} className="relative">
      {/* Botão principal */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpenSide("start", "main"))}
        className={`flex items-center justify-between gap-3 px-5 py-2.5 bg-white border rounded-2xl text-sm font-medium text-gray-700 shadow-sm transition-colors min-w-[140px] cursor-pointer ${
          open ? "border-blue-500" : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-gray-400" />
          <span>Período</span>
          {compEnabled && (
            <span className="inline-flex items-center justify-center px-1.5 h-4 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold leading-none">
              vs
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-[480px] overflow-hidden">

          {/* Header com guia do passo atual */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">{stepHint}</span>
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Alterações pendentes · clique em Aplicar
              </span>
            )}
          </div>

          <div className="px-5 pb-4">
            {/* ── Período principal ── */}
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Período principal</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "main" && activeSide === "start" ? "text-blue-600" : "text-gray-400"}`}>
                  Início
                </p>
                <button
                  onClick={() => handleOpenSide("start", "main")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                    activePeriod === "main" && activeSide === "start"
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{formatLabel(dStart.month, dStart.year)}</span>
                  <Calendar size={15} className={activePeriod === "main" && activeSide === "start" ? "text-blue-500" : "text-gray-300"} />
                </button>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "main" && activeSide === "end" ? "text-blue-600" : "text-gray-400"}`}>
                  Término
                </p>
                <button
                  onClick={() => handleOpenSide("end", "main")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                    activePeriod === "main" && activeSide === "end"
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{formatLabel(dEnd.month, dEnd.year)}</span>
                  <Calendar size={15} className={activePeriod === "main" && activeSide === "end" ? "text-blue-500" : "text-gray-300"} />
                </button>
              </div>
            </div>

            {/* ── Toggle comparação ── */}
            <div className="flex items-center justify-between py-2.5 px-1 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Comparação</span>
                <span className="text-[11px] text-gray-400">Compara o período principal com outro</span>
              </div>
              <button
                onClick={handleToggleComp}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  dCompEnabled ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    dCompEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* ── Período de comparação ── */}
            {dCompEnabled && (
              <div className="flex gap-3 mt-3 mb-1">
                <div className="flex-1">
                  <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "comp" && activeSide === "start" ? "text-purple-600" : "text-gray-400"}`}>
                    Início (comparação)
                  </p>
                  <button
                    onClick={() => handleOpenSide("start", "comp")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                      activePeriod === "comp" && activeSide === "start"
                        ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{formatLabel(dCompStart.month, dCompStart.year)}</span>
                    <Calendar size={15} className={activePeriod === "comp" && activeSide === "start" ? "text-purple-500" : "text-gray-300"} />
                  </button>
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold mb-1.5 ${activePeriod === "comp" && activeSide === "end" ? "text-purple-600" : "text-gray-400"}`}>
                    Término (comparação)
                  </p>
                  <button
                    onClick={() => handleOpenSide("end", "comp")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                      activePeriod === "comp" && activeSide === "end"
                        ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{formatLabel(dCompEnd.month, dCompEnd.year)}</span>
                    <Calendar size={15} className={activePeriod === "comp" && activeSide === "end" ? "text-purple-500" : "text-gray-300"} />
                  </button>
                </div>
              </div>
            )}

            {/* Separador */}
            <div className="border-t border-gray-100 my-4" />

            {/* Navegação de ano */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={() => setNavYear((y) => Math.max(minYear, y - 1))}
                disabled={navYear <= minYear}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg cursor-pointer"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-gray-800">{navYear}</span>
              <button
                onClick={() => setNavYear((y) => Math.min(maxYear, y + 1))}
                disabled={navYear >= maxYear}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors text-lg cursor-pointer"
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
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
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

            {/* Mensagens de validação */}
            <div className="flex flex-col gap-1 mt-3 min-h-[18px]">
              {(!periodoValido || !compPeriodoValido) && (
                <p className="text-xs text-red-500 text-center">
                  O início não pode ser maior que o término.
                </p>
              )}
              {compTamanhosDiferentes && (
                <p className="text-xs text-amber-500 text-center">
                  O período de comparação deve ter a mesma duração do principal ({mainMonths + 1} {mainMonths === 0 ? "mês" : "meses"}).
                </p>
              )}
            </div>
          </div>

          {/* Footer com Aplicar / Cancelar */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X size={14} />
              {hasUnsavedChanges ? "Cancelar" : "Fechar"}
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                canApply
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check size={14} />
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
