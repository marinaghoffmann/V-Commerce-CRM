import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DateInputField } from "../molecules/DateInputField";
import { CalendarPicker } from "../molecules/CalendarPicker";

export interface DateRange {
  data_inicio: string | null;
  data_fim: string | null;
}

interface DateRangeFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

const formatDateToBR = (dateStr: string | null) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateToISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseBRToISO = (brStr: string) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = brStr.match(regex);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const testDate = new Date(year, month - 1, day);
  if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
    return null;
  }
  return `${y}-${m}-${d}`;
};

export const DateRangeFilter = ({ selected, onChange }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(selected);
  const [activeField, setActiveField] = useState<'inicio' | 'fim' | null>(null);

  const [inicioText, setInicioText] = useState(selected.data_inicio ? formatDateToBR(selected.data_inicio) : "");
  const [fimText, setFimText] = useState(selected.data_fim ? formatDateToBR(selected.data_fim) : "");

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(selected);
    setInicioText(selected.data_inicio ? formatDateToBR(selected.data_inicio) : "");
    setFimText(selected.data_fim ? formatDateToBR(selected.data_fim) : "");
  }, [selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeField === 'inicio' && draft.data_inicio) {
      const [year, month] = draft.data_inicio.split("-").map(Number);
      setCurrentYear(year);
      setCurrentMonth(month - 1);
    } else if (activeField === 'fim' && draft.data_fim) {
      const [year, month] = draft.data_fim.split("-").map(Number);
      setCurrentYear(year);
      setCurrentMonth(month - 1);
    }
  }, [activeField, draft.data_inicio, draft.data_fim]);

  const handleApply = () => {
    if (draft.data_inicio && draft.data_fim && draft.data_fim < draft.data_inicio) {
      alert("A data de término não pode ser anterior à data de início.");
      return;
    }
    onChange(draft);
    setOpen(false);
    setActiveField(null);
  };

  const handleClear = () => {
    const cleared: DateRange = { data_inicio: null, data_fim: null };
    setDraft(cleared);
    setInicioText("");
    setFimText("");
    onChange(cleared);
    setOpen(false);
    setActiveField(null);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateToISO(date);
    const formattedBR = formatDateToBR(dateStr);

    const clickedMonth = date.getMonth();
    const clickedYear = date.getFullYear();
    if (clickedMonth !== currentMonth || clickedYear !== currentYear) {
      setCurrentMonth(clickedMonth);
      setCurrentYear(clickedYear);
    }

    if (activeField === 'inicio') {
      if (draft.data_fim && dateStr > draft.data_fim) {
        setDraft({ data_inicio: dateStr, data_fim: null });
        setInicioText(formattedBR);
        setFimText("");
      } else {
        setDraft({ ...draft, data_inicio: dateStr });
        setInicioText(formattedBR);
      }
      setActiveField('fim');
    } else if (activeField === 'fim') {
      if (draft.data_inicio && dateStr < draft.data_inicio) {
        setDraft({ data_inicio: dateStr, data_fim: draft.data_inicio });
        setInicioText(formattedBR);
        setFimText(formatDateToBR(draft.data_inicio));
      } else {
        setDraft({ ...draft, data_fim: dateStr });
        setFimText(formattedBR);
      }
      setActiveField(null);
    }
  };

  const handleTextChange = (value: string, field: 'inicio' | 'fim') => {
    const clean = value.replace(/\D/g, "");
    let formatted = "";
    if (clean.length > 0) {
      formatted += clean.substring(0, 2);
    }
    if (clean.length > 2) {
      formatted += "/" + clean.substring(2, 4);
    }
    if (clean.length > 4) {
      formatted += "/" + clean.substring(4, 8);
    }

    if (field === 'inicio') {
      setInicioText(formatted);
      if (formatted.length === 10) {
        const parsed = parseBRToISO(formatted);
        if (parsed) {
          setDraft((prev) => ({ ...prev, data_inicio: parsed }));
        }
      } else {
        setDraft((prev) => ({ ...prev, data_inicio: null }));
      }
    } else {
      setFimText(formatted);
      if (formatted.length === 10) {
        const parsed = parseBRToISO(formatted);
        if (parsed) {
          setDraft((prev) => ({ ...prev, data_fim: parsed }));
        }
      } else {
        setDraft((prev) => ({ ...prev, data_fim: null }));
      }
    }
  };

  const hasSelection = Boolean(selected.data_inicio) || Boolean(selected.data_fim);

  const formattedStart = formatDateToBR(selected.data_inicio);
  const formattedEnd = formatDateToBR(selected.data_fim);
  const displayText = hasSelection
    ? `${formattedStart || "—"} a ${formattedEnd || "—"}`
    : "Período";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (!next) {
              setActiveField(null);
            }
            return next;
          });
        }}
        className={[
          "flex items-center justify-between gap-2 rounded-full border text-sm font-medium transition-all shadow-sm whitespace-nowrap cursor-pointer select-none min-w-[180px]",
          hasSelection
            ? "border-blue-500 bg-blue-500 text-white pl-2 pr-5 py-2.5 hover:bg-blue-600 hover:border-blue-600 font-semibold"
            : "border-[#D2DDEC] bg-white text-slate-700 hover:border-slate-355 hover:bg-slate-50 px-5 py-2.5",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          {hasSelection && (
            <>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
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
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 flex-shrink-0 ${hasSelection ? "text-white" : "text-slate-500"} ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 bg-white border border-[#D2DDEC] rounded-[28px] shadow-2xl p-5"
          style={{ width: "380px" }}
        >
          <div className="flex gap-4 mb-2">
            <DateInputField
              label="Início"
              value={inicioText}
              placeholder="dd/mm/aaaa"
              isActive={activeField === 'inicio'}
              hasValue={Boolean(draft.data_inicio)}
              onChange={(val) => handleTextChange(val, 'inicio')}
              onFocus={() => setActiveField('inicio')}
              onClear={() => {
                setDraft({ ...draft, data_inicio: null });
                setInicioText("");
              }}
              onToggleCalendar={() => setActiveField((prev) => prev === 'inicio' ? null : 'inicio')}
            />

            <DateInputField
              label="Término"
              value={fimText}
              placeholder="dd/mm/aaaa"
              isActive={activeField === 'fim'}
              hasValue={Boolean(draft.data_fim)}
              onChange={(val) => handleTextChange(val, 'fim')}
              onFocus={() => setActiveField('fim')}
              onClear={() => {
                setDraft({ ...draft, data_fim: null });
                setFimText("");
              }}
              onToggleCalendar={() => setActiveField((prev) => prev === 'fim' ? null : 'fim')}
            />
          </div>

          {activeField ? (
            <CalendarPicker
              currentMonth={currentMonth}
              currentYear={currentYear}
              dataInicio={draft.data_inicio}
              dataFim={draft.data_fim}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDayClick={handleDayClick}
            />
          ) : (
            <div className="flex items-center justify-center mt-5 w-full">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-all cursor-pointer text-center shadow-md shadow-blue-500/10"
              >
                Aplicar filtro
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
