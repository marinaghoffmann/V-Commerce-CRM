import { useRef, useEffect, useState, useCallback } from "react";

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
      {/* Antena central */}
      <line x1="14" y1="2" x2="14" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="2" r="1.5" fill="white" />

      {/* Cabeça / corpo do robô */}
      <rect x="5" y="6" width="18" height="14" rx="3" stroke="white" strokeWidth="2" />

      {/* Olhos */}
      <rect x="9" y="10" width="3" height="3" rx="1" fill="white" />
      <rect x="16" y="10" width="3" height="3" rx="1" fill="white" />

      {/* Boca */}
      <line x1="10" y1="16" x2="18" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Braços laterais */}
      <rect x="2" y="10" width="3" height="6" rx="1.5" fill="white" opacity="0.7" />
      <rect x="23" y="10" width="3" height="6" rx="1.5" fill="white" opacity="0.7" />
    </svg>
  );
}

export function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  // ─── Posição do botão (relativa ao viewport, em px) ───────────────────────
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Inicializa no canto inferior direito assim que o componente monta
  useEffect(() => {
    setPos({
      x: window.innerWidth - 80,   // 80px da borda direita
      y: window.innerHeight - 80,  // 80px da borda inferior
    });
  }, []);

  // ─── Refs para a lógica de arrasto ───────────────────────────────────────
  const isDragging   = useRef(false);  // true enquanto o mouse/touch está pressionado e movendo
  const hasMoved     = useRef(false);  // true se houve deslocamento real (distingue clique de arrasto)
  const startPointer = useRef({ x: 0, y: 0 }); // posição do ponteiro no início do gesto
  const startPos     = useRef({ x: 0, y: 0 }); // posição do botão no início do gesto

  // Tamanho do botão (usado para manter dentro do viewport)
  const BUTTON_SIZE = 56;

  // ─── Clamp: garante que o botão nunca saia da tela ───────────────────────
  const clamp = useCallback(
    (x: number, y: number) => ({
      x: Math.min(Math.max(x, 0), window.innerWidth  - BUTTON_SIZE),
      y: Math.min(Math.max(y, 0), window.innerHeight - BUTTON_SIZE),
    }),
    []
  );

  // ─── Início do gesto (mousedown / touchstart) ────────────────────────────
  const onPointerDown = useCallback(
    (clientX: number, clientY: number) => {
      isDragging.current   = true;
      hasMoved.current     = false;
      startPointer.current = { x: clientX, y: clientY };
      startPos.current     = { ...pos };
    },
    [pos]
  );

  // ─── Movimento (mousemove / touchmove) ───────────────────────────────────
  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging.current) return;

      const dx = clientX - startPointer.current.x;
      const dy = clientY - startPointer.current.y;

      // Considera "arrasto real" se o ponteiro andou mais de 5px
      if (!hasMoved.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        hasMoved.current = true;
      }

      if (hasMoved.current) {
        setPos(clamp(startPos.current.x + dx, startPos.current.y + dy));
      }
    },
    [clamp]
  );

  // ─── Fim do gesto (mouseup / touchend) ───────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Só dispara clique se NÃO houve arrasto real
    // Passa a posição atual do botão para o pai poder abrir o chat perto dele
    if (!hasMoved.current) {
      onClick({ ...pos });
    }
  }, [onClick]);

  // ─── Listeners globais (necessário para capturar movimentos fora do botão) ─
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // evita scroll da página durante o arrasto
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onMouseUp  = () => onPointerUp();
    const onTouchEnd = () => onPointerUp();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [onPointerMove, onPointerUp]);

  return (
    <button
      aria-label="Abrir Agente de IA"
      // ── Eventos de início do gesto ─────────────────────────────────────────
      onMouseDown={(e) => {
        e.preventDefault(); // evita seleção de texto acidental
        onPointerDown(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }}
      // ── Bloqueia o onClick nativo do elemento; usamos nossa lógica acima ──
      onClick={(e) => e.preventDefault()}
      style={{
        // Posicionamento fixo no viewport
        position : "fixed",
        left     : pos.x,
        top      : pos.y,
        width    : BUTTON_SIZE,
        height   : BUTTON_SIZE,
        zIndex   : 9999,

        // Visual
        borderRadius    : "50%",
        backgroundColor : "var(--ai-btn-color, #2563EB)",
        border          : "none",
        cursor          : isDragging.current ? "grabbing" : "grab",
        display         : "flex",
        alignItems      : "center",
        justifyContent  : "center",
        userSelect      : "none",
        WebkitUserSelect: "none",
        touchAction     : "none",

        // Sombra flutuante moderna
        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(0,0,0,0.15)",

        // Transição para efeito hover (escala)
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      // Hover via classes inline não funciona com style; usamos onMouseEnter/Leave
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1.1)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow  =
          "0 12px 32px rgba(37, 99, 235, 0.55), 0 4px 12px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow  =
          "0 8px 24px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(0,0,0,0.15)";
      }}
    >
      <RobotIcon />
    </button>
  );
}
