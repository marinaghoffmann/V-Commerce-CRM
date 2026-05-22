import React from 'react';

interface FeaturePillProps {
  text: string;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ text }) => {
  return (
    <span className="bg-[#244FAD] text-[#EEF4FF] px-4 py-1.5 rounded-full text-sm">
      {text}
    </span>
  );
};
