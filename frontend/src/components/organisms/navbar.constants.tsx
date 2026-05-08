import type { NavItemConfig } from "../types/navbar.types";

import DashboardIcon from "../../assets/navbar_icons/DashboardIcon.svg?react";
import DashboardActiveIcon from "../../assets/navbar_icons/DashboardIconFill.svg?react";

import ClientesIcon from "../../assets/navbar_icons/ClientesIcon.svg?react";
import ClientesActiveIcon from "../../assets/navbar_icons/ClientesIconFill.svg?react";

import PedidosIcon from "../../assets/navbar_icons/PedidosIcon.svg?react";
import PedidosActiveIcon from "../../assets/navbar_icons/PedidosIconFill.svg?react";

import ProdutosIcon from "../../assets/navbar_icons/ProdutosIcon.svg?react";
import ProdutosActiveIcon from "../../assets/navbar_icons/ProdutosIconFill.svg?react";

import SuporteIcon from "../../assets/navbar_icons/SuporteIcon.svg?react";
import SuporteActiveIcon from "../../assets/navbar_icons/SuporteIconFill.svg?react";

import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";
import AssistenteActiveIcon from "../../assets/navbar_icons/AssistenteIconFill.svg?react";

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon className="size-5 text-white/70" />,
    path: "/dashboard",
    activeIcon: (
      <DashboardActiveIcon className="size-5 text-blue scale-110" />
    ),
  },

  {
    id: "clientes",
    label: "Clientes",
    icon: <ClientesIcon className="size-5 text-white/70" />,
    path: "/clientes",
    activeIcon: (
      <ClientesActiveIcon className="size-5 text-blue scale-110" />
    ),
  },

  {
    id: "pedidos",
    label: "Pedidos",
    icon: <PedidosIcon className="size-5 text-white/70" />,
    path: "/pedidos",
    activeIcon: (
      <PedidosActiveIcon className="size-5 text-blue scale-110" />
    ),
  },

  {
    id: "produtos",
    label: "Produtos",
    icon: <ProdutosIcon className="size-5 text-white/70" />,
    path: "/produtos",
    activeIcon: (
      <ProdutosActiveIcon className="size-5 text-blue scale-110" />
    ),
  },

  {
    id: "suporte",
    label: "Suporte",
    icon: <SuporteIcon className="size-5 text-white/70" />,
    path: "/suporte",
    activeIcon: (
      <SuporteActiveIcon className="size-5 text-blue scale-110" />
    ),
  },

  {
    id: "assistente",
    label: "Assistente de IA",
    icon: <AssistenteIcon className="size-5 text-white/70" />,
    path: "/assistente",
    activeIcon: (
      <AssistenteActiveIcon className="size-5 text-blue scale-110" />
    ),
  },
];