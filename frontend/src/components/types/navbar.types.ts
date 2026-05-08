import type { ReactNode } from "react";

export type NavItemId =
  | "dashboard"
  | "clientes"
  | "pedidos"
  | "produtos"
  | "suporte"
  | "assistente";

export interface NavItemConfig {
  id: NavItemId;
  label: string;
  path: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}
