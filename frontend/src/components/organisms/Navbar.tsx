import type { NavItemId } from "../types/navbar.types";
import { NavItem } from "../molecules/NavItem";
import { NAV_ITEMS } from "./navbar.constants";
import { useLocation } from "react-router-dom";
import { useChatbot } from "../../contexts/ChatbotContext";
import { NavIcon } from "../atoms/NavIcon";
import { NavLabel } from "../atoms/NavLabel";


interface NavbarProps {
  defaultActive?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
}

export function Navbar({}: NavbarProps) {

  const location = useLocation();
  const { toggleOverlay } = useChatbot();

  return (
    <nav aria-label="Menu principal" className="relative z-50 w-full my-10">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="bg-blue-500 rounded-full flex items-center justify-between gap-1 p-2 px-6 h-15 w-full">
          {NAV_ITEMS.map((item) => (
            item.id === "assistente" ? (
              <button
                key={item.id}
                onClick={toggleOverlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border-none transition-all duration-200 cursor-pointer font-[inherit] bg-transparent text-white/75 hover:text-white hover:bg-white/10"
                aria-label={item.label}
              >
                <NavIcon>{item.icon}</NavIcon>
                <NavLabel>{item.label}</NavLabel>
              </button>
            ) : (
              <NavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                activeIcon={item.activeIcon}
                active={item.path === location.pathname}
                path={item.path}
              />
            )
          ))}
        </div>
      </div>
    </nav>
  );
}
