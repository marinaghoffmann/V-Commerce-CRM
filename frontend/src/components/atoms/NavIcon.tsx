import type { ReactNode } from "react";

interface NavIconProps {
  children: ReactNode;
}

export function NavIcon({ children }: NavIconProps) {
  return (
    <span className="flex items-center justify-center flex-shrink-0">
      {children}
    </span>
  );
}
