import React from 'react';

interface StatItemProps {
  value: string;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({ value, label }) => {
  return (
    <div className="flex-1 flex flex-col items-center">
      <span className="text-4xl lg:text-5xl font-black mb-2">{value}</span>
      <span className="text-sm font-normal uppercase tracking-wider">{label}</span>
    </div>
  );
};
