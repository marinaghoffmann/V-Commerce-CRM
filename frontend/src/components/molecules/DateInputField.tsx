import { X } from "lucide-react";

interface DateInputFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isActive: boolean;
  hasValue: boolean;
  onChange: (val: string) => void;
  onFocus: () => void;
  onClear: () => void;
  onToggleCalendar: () => void;
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="17" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
    <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <text x="12" y="17" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">12</text>
  </svg>
);

export const DateInputField = ({
  label,
  value,
  placeholder,
  isActive,
  hasValue,
  onChange,
  onFocus,
  onClear,
  onToggleCalendar,
}: DateInputFieldProps) => {
  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[#4F5B76] pl-1">{label}</span>
      <div
        className={`flex items-center justify-between border rounded-2xl p-1 pl-3.5 h-12 transition-all ${
          isActive
            ? "border-blue-600 ring-2 ring-blue-600/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400 font-semibold"
        />
        <div className="flex items-center flex-shrink-0">
          {hasValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 mr-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCalendar();
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isActive || hasValue
                ? "bg-blue-600 text-white"
                : "bg-[#F1F5F9] text-slate-500"
            }`}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
