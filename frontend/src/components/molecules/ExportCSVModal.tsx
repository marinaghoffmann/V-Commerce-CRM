import React from "react";

interface ExportCSVModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExportCSVModal({ isOpen, onCancel, onConfirm }: ExportCSVModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(10, 15, 30, 0.55)", backdropFilter: "blur(2px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm mx-4 overflow-hidden"
        style={{ borderRadius: "28px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top section — light blue */}
        <div
          className="px-8 py-8"
          style={{ background: "#EEF4FF", borderBottom: "1.5px solid #D9E4F5" }}
        >
          <p
            className="text-[#0F2A6E] font-bold leading-relaxed"
            style={{ fontSize: "1.05rem", lineHeight: "1.65" }}
          >
            Deseja exportar o arquivo CSV com todas as informações da tabela atual?
          </p>
        </div>

        {/* Bottom section — white */}
        <div className="px-8 py-5 bg-white flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer"
            style={{
              border: "1.5px solid #E53E3E",
              color: "#E53E3E",
              borderRadius: "10px",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FFF5F5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-all duration-150 cursor-pointer"
            style={{
              background: "#2563EB",
              borderRadius: "10px",
              border: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
            }}
          >
            {/* Export icon: box with arrow up */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
