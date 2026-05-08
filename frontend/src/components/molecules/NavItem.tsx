import type { ReactNode } from "react";
import { NavIcon } from "../atoms/NavIcon";
import { NavLabel } from "../atoms/NavLabel";
import { Link } from "react-router-dom";


interface NavItemProps {
  label: string;
  icon: ReactNode;
  path: string;
  activeIcon?: ReactNode;
  active?: boolean;
}

export function NavItem({ label, icon, path, activeIcon, active = false }: NavItemProps) {
  return (
    <Link
      to={path}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-2 px-5 py-2.5 rounded-full border-none transition-all duration-200 cursor-pointer font-[inherit]",
        active
          ? "bg-white text-blue-600 shadow-md"
          : "bg-transparent text-white/75 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      <NavIcon>{active ? (activeIcon || icon) : icon}</NavIcon>
      <NavLabel>{label}</NavLabel>
    </Link>
  );
}
