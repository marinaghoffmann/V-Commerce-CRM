import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  currentMonth: number;
  currentYear: number;
  dataInicio: string | null;
  dataFim: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const formatDateToISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const CalendarPicker = ({
  currentMonth,
  currentYear,
  dataInicio,
  dataFim,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: CalendarPickerProps) => {
  const daysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    const firstDayIndex = firstDay.getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0, 12, 0, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0, 12, 0, 0).getDate();
    
    const days: { date: Date; isCurrentMonth: boolean; key: string; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `prev-${dayNum}`,
        dateStr: formatDateToISO(d)
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(currentYear, currentMonth, i, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: true,
        key: `curr-${i}`,
        dateStr: formatDateToISO(d)
      });
    }

    const totalSlots = 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `next-${i}`,
        dateStr: formatDateToISO(d)
      });
    }

    return days;
  };

  const calendarDays = daysInMonth();

  return (
    <div className="mt-4">
      <div className="border-t border-slate-100 mb-4" />
      
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-500 mb-1">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-sm font-medium">
        {calendarDays.map((day) => {
          const isStart = dataInicio === day.dateStr;
          const isEnd = dataFim === day.dateStr;
          const isRange = dataInicio && dataFim && day.dateStr > dataInicio && day.dateStr < dataFim;

          let cellClass = "";
          if (isStart && isEnd) {
            cellClass = "bg-blue-600 text-white rounded-full font-semibold shadow-sm";
          } else if (isStart) {
            cellClass = "bg-blue-600 text-white rounded-l-full font-semibold shadow-sm";
          } else if (isEnd) {
            cellClass = "bg-blue-600 text-white rounded-r-full font-semibold shadow-sm";
          } else if (isRange) {
            cellClass = "bg-blue-50 text-blue-600 rounded-none font-semibold";
          } else if (day.isCurrentMonth) {
            cellClass = "text-slate-800 hover:bg-slate-100 rounded-full font-semibold";
          } else {
            cellClass = "text-slate-300 hover:bg-slate-50 rounded-full";
          }

          return (
            <div key={day.key} className="py-0.5 flex justify-center">
              <button
                type="button"
                onClick={() => onDayClick(day.date)}
                className={`w-9 h-9 flex items-center justify-center text-xs transition-all cursor-pointer ${cellClass}`}
              >
                {String(day.date.getDate()).padStart(2, "0")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
