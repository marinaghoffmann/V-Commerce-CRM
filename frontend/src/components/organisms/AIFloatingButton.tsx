import { useState } from "react";

interface AIFloatingButtonProps {
  onClick: (pos: { x: number; y: number }) => void;
}

function RobotIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="14" y1="2" x2="14" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="2" r="1.5" fill="white" />
      <rect x="5" y="6" width="18" height="14" rx="3" stroke="white" strokeWidth="2" />
      <rect x="9" y="10" width="3" height="3" rx="1" fill="white" />
      <rect x="16" y="10" width="3" height="3" rx="1" fill="white" />
      <line x1="10" y1="16" x2="18" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="10" width="3" height="6" rx="1.5" fill="white" opacity="0.7" />
      <rect x="23" y="10" width="3" height="6" rx="1.5" fill="white" opacity="0.7" />
    </svg>
  );
}

const BUTTON_SIZE = 56;

export function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  // Inicialização lazy: calcula a posição correta já no primeiro render,
  // evitando o "salto" de (0,0) → canto inferior direito.
  const [pos] = useState(() => ({
    x: window.innerWidth  - 80,
    y: window.innerHeight - 80,
  }));

  return (
    <button
      aria-label="Abrir Agente de IA"
      onClick={() => onClick({ ...pos })}
      className="fixed z-[9999] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--ai-btn-color,#2563EB)] shadow-[0_8px_24px_rgba(37,99,235,0.45),0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,99,235,0.55),0_4px_12px_rgba(0,0,0,0.2)]"
      style={{ left: pos.x, top: pos.y, width: BUTTON_SIZE, height: BUTTON_SIZE }}
    >
      <RobotIcon />
    </button>
  );
}