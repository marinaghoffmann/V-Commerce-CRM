import type { NavItemId } from "../types/navbar.types";
import { NavItem } from "../molecules/NavItem";
import { NAV_ITEMS } from "./navbar.constants";
import { useLocation } from "react-router-dom";


interface NavbarProps {
  defaultActive?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
}

export function Navbar({}: NavbarProps) {

  const location = useLocation();


  return (
    <nav
      aria-label="Menu principal"
      className="bg-blue-500 rounded-full flex items-center justify-between gap-1 p-2 px-6 h-15 mx-auto my-10 w-[95%]"
    >
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          activeIcon={item.activeIcon}
          active={item.path === location.pathname}
          path={item.path}
        />
      ))}
    </nav>
  );
}
