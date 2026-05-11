import type { ReactNode } from "react";

interface KpiCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
}

export function KpiCard({ icon, iconBg, label, value }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm border border-gray-100 flex-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}