import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Eye, Ticket, Star, TrendingUp, TrendingDown } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useProdutoDetalhe, useTicketsProduto } from "../../hooks/useProdutoDetalhe";
import type { Product } from "../types/product.types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);


function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

const MES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];


const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Automotivo: { bg: "bg-zinc-50",    border: "border-zinc-200",   text: "text-zinc-700"   },
  Beleza:     { bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700"   },
  Brinquedos: { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700" },
  Casa:       { bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700" },
  Eletronicos:{ bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700"   },
  Esportes:   { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700"  },
  Moveis:     { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700"  },
  Vestuario:  { bg: "bg-pink-50",    border: "border-pink-200",   text: "text-pink-700"   },
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
}


function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "text-yellow-400" : "text-gray-200"}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.011 4.665 24 6 15.595 0 9.748l8.332-1.73z" />
        </svg>
      ))}
    </div>
  );
}


function KpiCard({
  label,
  value,
  sub,
  accent,
  progress,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red";
  progress?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span
        className={`text-2xl font-bold leading-none ${
          accent === "green" ? "text-emerald-600" : accent === "red" ? "text-red-500" : "text-gray-900"
        }`}
      >
        {value}
      </span>
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isOpen = s === "aberto";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isOpen
          ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-amber-500" : "bg-emerald-500"}`} />
      {isOpen ? "Aberto" : "Fechado"}
    </span>
  );
}


function ModalShell({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <div
        className="relative w-full mx-4 rounded-[32px] shadow-2xl overflow-hidden"
        style={{ maxWidth: "588px", background: "#FBFBFB", border: "1px solid #9CA3AF" }}
      >
        {children}
      </div>
    </div>
  );
}

import { Check, X, Trash2 as Trash2Icon, ImageIcon, AlertTriangle } from "lucide-react";
import api from "../../services/api";

interface FormState {
  id_produto: string;
  nome_produto: string;
  categoria: string;
  preco: string;
  estoque_disponivel: string;
}

function Field({ label, value, onChange, type = "text", disabled = false, error, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; disabled?: boolean; error?: string; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400
            ${prefix ? "pl-8" : ""}
            ${error ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-white"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" : ""}`}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function EditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>({
    id_produto: product.id_produto,
    nome_produto: product.nome_produto ?? "",
    categoria: product.categoria ?? "",
    preco: String(product.preco ?? ""),
    estoque_disponivel: String(product.estoque_disponivel ?? ""),
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.nome_produto.trim()) e.nome_produto = "Nome obrigatório";
    if (!form.categoria.trim()) e.categoria = "Categoria obrigatória";
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) <= 0) e.preco = "Preço inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.patch(`/produto/${form.id_produto}`, {
        nome_produto: form.nome_produto.trim(),
        categoria: form.categoria.trim(),
        preco: Number(form.preco),
        estoque_disponivel: form.estoque_disponivel ? Number(form.estoque_disponivel) : 0,
      });
      setSaved(true);
      setTimeout(() => onSaved(), 1500);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <ModalShell>
        <div className="flex flex-col items-center justify-center py-14 px-8 gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)" }}>
            <Check size={40} strokeWidth={2.5} className="text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-gray-800">Edições salvas com sucesso!</p>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}>
          <ImageIcon size={22} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold" style={{ color: "#1E3A5F" }}>Editar produto</h2>
          <span className="text-xs text-gray-400 font-mono">SKU: {form.id_produto}</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"><X size={16} /></button>
      </div>
      <div className="px-8 py-6 flex flex-col gap-4">
        <Field label="Nome do produto" value={form.nome_produto} onChange={(v) => setForm((f) => ({ ...f, nome_produto: v }))} error={errors.nome_produto} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU" value={form.id_produto} onChange={() => {}} disabled />
          <Field label="Categoria" value={form.categoria} onChange={(v) => setForm((f) => ({ ...f, categoria: v }))} error={errors.categoria} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preço (R$)" value={form.preco} onChange={(v) => setForm((f) => ({ ...f, preco: v }))} type="number" error={errors.preco} prefix="R$" />
          <Field label="Estoque restante" value={form.estoque_disponivel} onChange={(v) => setForm((f) => ({ ...f, estoque_disponivel: v }))} type="number" />
        </div>
      </div>
      <div className="px-8 pb-7 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: "#9CA3AF" }}>Cancelar</button>
        <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" style={{ background: "#2563EB" }}>
          {saving ? "Salvando..." : <><Check size={15} strokeWidth={2.5} /> Salvar edições</>}
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteModal({ product, onCancel, onDeleted }: { product: Product; onCancel: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await api.delete(`/produto/${product.id_produto}`);
      setDeleted(true);
      setTimeout(() => onDeleted(), 1500);
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return (
      <ModalShell>
        <div className="flex flex-col items-center justify-center py-14 px-8 gap-5" style={{ background: "#FFF5F5" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}>
            <AlertTriangle size={38} strokeWidth={2} className="text-red-500" />
          </div>
          <p className="text-base font-semibold text-red-700">Produto deletado.</p>
        </div>
      </ModalShell>
    );
  }

  const catColor = getCategoryColor(product.categoria ?? "");

  return (
    <ModalShell onClose={onCancel}>
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <AlertTriangle size={22} className="text-red-500" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold" style={{ color: "#991B1B" }}>Deseja deletar o produto?</h2>
          <p className="text-xs text-red-400 mt-0.5">Essa ação não pode ser desfeita.</p>
        </div>
        <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"><X size={16} /></button>
      </div>
      <div className="px-8 py-6">
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <ImageIcon size={24} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{product.nome_produto}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">SKU: {product.id_produto}</span>
              {product.categoria && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catColor.bg} ${catColor.border} ${catColor.text}`}>{product.categoria}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-1.5">{formatCurrency(product.preco)}</p>
          </div>
        </div>
      </div>
      <div className="px-8 pb-7 flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: "#9CA3AF" }}>Cancelar</button>
        <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" style={{ background: "#DC2626" }}>
          {deleting ? "Deletando..." : <><Trash2Icon size={15} strokeWidth={2} /> Deletar</>}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { produto, historico, loading, error } = useProdutoDetalhe(id);
  const [ticketPage, setTicketPage] = useState(1);
  const TICKET_LIMIT = 6;
  const { data: ticketsData, loading: ticketsLoading } = useTicketsProduto(id, ticketPage, TICKET_LIMIT);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ─── Derived data ───────────────────────────────────────────────────────────

  const sold = produto?.unidades_vendidas ?? 0;
  const stock = produto?.estoque_disponivel ?? 0;
  const denom = sold + stock || 1;
  const pctVendido = ((sold / denom) * 100).toFixed(1);

  const totalTicketPages = ticketsData ? Math.ceil(ticketsData.total / TICKET_LIMIT) : 1;

  // Last 12 months from historico
  const last12 = historico.slice(-12);
  const monthLabels = last12.map((h) => `${MES_ABREV[h.mes - 1]}/${String(h.ano).slice(-2)}`);
  const revenueValues = last12.map((h) => h.receita_total);
  const ordersValues = last12.map((h) => h.total_pedidos);

  // Month-over-month revenue growth
  const lastRev = last12[last12.length - 1]?.receita_total ?? 0;
  const prevRev = last12[last12.length - 2]?.receita_total ?? 0;
  const revenueGrowth = prevRev > 0 ? ((lastRev - prevRev) / prevRev) * 100 : 0;

  // Chart data — same style as Dashboard
  const revenueChartData = {
    labels: monthLabels,
    datasets: [{
      data: revenueValues,
      borderColor: "#3B6FF6",
      backgroundColor: "rgba(59,111,246,0.12)",
      fill: true,
      tension: 0.45,
      pointRadius: 3,
      pointBackgroundColor: "#3B6FF6",
      borderWidth: 1.5,
    }],
  };

  const ordersChartData = {
    labels: monthLabels,
    datasets: [{
      data: ordersValues,
      backgroundColor: "#3B6FF6",
      borderRadius: { topLeft: 4, topRight: 4 },
      borderSkipped: false,
    }],
  };

  // ─── Avaliações — distribuição aproximada com base na média ─────────────────
  const nota = produto?.media_nota_produto ?? 0;
  const totalAv = produto?.total_avaliacoes ?? 0;

  // Build a plausible distribution from the average rating
  const ratingDistribution = (() => {
    if (totalAv === 0) return [0, 0, 0, 0, 0];
    // Simple heuristic: concentrate mass around the mean
    const weights = [1, 2, 3, 4, 5].map((star) => Math.exp(-0.8 * Math.abs(star - nota)));
    const total = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => Math.round((w / total) * 100));
  })();

  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FE]">
        <div className="max-w-screen-xl mx-auto px-8 pb-12 pt-2">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 flex gap-8">
            <div className="w-36 h-36 bg-gray-200 rounded-2xl animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-64 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <div className="text-gray-400 text-sm">{error ?? "Produto não encontrado."}</div>
      </div>
    );
  }

  const catColor = getCategoryColor(produto.categoria ?? "");
  const cardStyle = "bg-white rounded-2xl border border-gray-100 shadow-sm";

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <div className="max-w-screen-xl mx-auto px-8 pb-12">

        {/* Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
            Detalhe do produto
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={() => navigate("/produtos")}
            >
              Catálogo de produtos
            </button>
            <span className="text-gray-300">›</span>
            <span className="text-blue-500 font-medium">{produto.nome_produto}</span>
          </div>
        </div>

        {/* ── Header card ─────────────────────────────────────────────────────── */}
        <div className={`${cardStyle} p-6 mb-6 flex flex-col sm:flex-row gap-6`}>
          {/* Placeholder imagem */}
          <div className="w-36 h-36 rounded-2xl shrink-0 flex items-center justify-center border border-gray-100 bg-gray-50">
            <ImageIcon size={40} className="text-gray-300" />
          </div>

          {/* Info central */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColor.bg} ${catColor.border} ${catColor.text}`}>
                {produto.categoria ?? "—"}
              </span>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                SKU: {produto.id_produto}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{produto.nome_produto}</h2>

            <div className="flex items-center gap-2">
              <StarRating value={produto.media_nota_produto ?? 0} />
              <span className="text-sm font-semibold text-yellow-500">{(produto.media_nota_produto ?? 0).toFixed(1)}</span>
              <span className="text-xs text-gray-400">{(produto.total_avaliacoes ?? 0).toLocaleString("pt-BR")} avaliações</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Eye size={13} />
              <span>{(produto.total_visualizacoes ?? 0).toLocaleString("pt-BR")} visualizações</span>
            </div>
          </div>

          {/* Ações e preço */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Preço unitário</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(produto.preco)}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Pencil size={13} /> Editar produto
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 size={13} /> Excluir produto
              </button>
            </div>

            {/* Estoque badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {(stock).toLocaleString("pt-BR")} em estoque
            </span>
          </div>
        </div>

        {/* ── KPI grid ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Unidades vendidas"
            value={sold.toLocaleString("pt-BR")}
            sub="desde o cadastro"
          />
          <KpiCard
            label="% do estoque vendido"
            value={`${pctVendido}%`}
            sub="do estoque total"
            progress={parseFloat(pctVendido)}
          />
          <KpiCard
            label="Receita total"
            value={formatCurrency(produto.receita_total)}
            sub="desde o cadastro"
          />
          <KpiCard
            label="Estoque restante"
            value={`${stock.toLocaleString("pt-BR")} unid.`}
            sub="disponíveis agora"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Crescimento mensal"
            value={`${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`}
            sub="vs. mês anterior"
            accent={revenueGrowth >= 0 ? "green" : "red"}
          />
          <KpiCard
            label="Taxa de tickets"
            value={
              produto.total_pedidos && produto.total_pedidos > 0
                ? `${(((produto.total_tickets ?? 0) / produto.total_pedidos) * 100).toFixed(1)}%`
                : "—"
            }
            sub="do total de pedidos"
          />
          <KpiCard
            label="Pedidos totais"
            value={(produto.total_pedidos ?? 0).toLocaleString("pt-BR")}
            sub="pedidos processados"
          />
          <KpiCard
            label="NPS médio"
            value={`${(produto.media_nota_nps ?? 0).toFixed(1)}`}
            sub={`${(produto.pct_recomenda ?? 0).toFixed(0)}% recomendam`}
          />
        </div>

        {/* ── Gráficos + coluna direita ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Coluna esquerda — gráficos */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Receita mensal */}
            <div className={`${cardStyle} p-6`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-gray-800">Receita mensal</h3>
                {revenueGrowth !== 0 && (
                  <span className={`flex items-center gap-1 text-xs font-semibold ${revenueGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {revenueGrowth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                )}
              </div>
              {last12.length > 0 && (
                <p className="text-xs text-gray-400 mb-4">
                  {MES_ABREV[last12[0].mes - 1]}/{last12[0].ano} — {MES_ABREV[last12[last12.length - 1].mes - 1]}/{last12[last12.length - 1].ano}
                </p>
              )}
              <div className="h-[220px]">
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                      y: {
                        beginAtZero: true,
                        grid: { color: "#F3F4F6" },
                        border: { display: false },
                        ticks: {
                          callback: (v) => {
                            const n = Number(v);
                            if (n >= 1_000_000) return `R$${(n / 1_000_000).toFixed(1)}M`;
                            if (n >= 1_000) return `R$${(n / 1_000).toFixed(0)}k`;
                            return `R$${n}`;
                          },
                          font: { size: 11 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Pedidos mensais */}
            <div className={`${cardStyle} p-6`}>
              <h3 className="text-base font-bold text-gray-800 mb-1">Pedidos mensais</h3>
              {last12.length > 0 && (
                <p className="text-xs text-gray-400 mb-4">
                  {MES_ABREV[last12[0].mes - 1]}/{last12[0].ano} — {MES_ABREV[last12[last12.length - 1].mes - 1]}/{last12[last12.length - 1].ano}
                </p>
              )}
              <div className="h-[200px]">
                <Bar
                  data={ordersChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                      y: {
                        beginAtZero: true,
                        grid: { color: "#F3F4F6" },
                        border: { display: false },
                        ticks: { font: { size: 11 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Coluna direita — info cards */}
          <div className="flex flex-col gap-4">

            {/* Tickets totais */}
            <div className={`${cardStyle} p-5 flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Ticket size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{(produto.total_tickets ?? 0).toLocaleString("pt-BR")} tickets</p>
                <p className="text-xs text-gray-400">
                  {produto.total_pedidos && produto.total_pedidos > 0
                    ? `${(((produto.total_tickets ?? 0) / produto.total_pedidos) * 100).toFixed(1)}% dos pedidos`
                    : "sem pedidos registrados"}
                </p>
              </div>
            </div>

            {/* Visualizações */}
            <div className={`${cardStyle} p-5 flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Eye size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{(produto.total_visualizacoes ?? 0).toLocaleString("pt-BR")}</p>
                <p className="text-xs text-gray-400">acessos ao produto</p>
              </div>
            </div>

            {/* Avaliações detalhadas */}
            <div className={`${cardStyle} p-5 flex flex-col gap-4`}>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-0.5">Avaliações</p>
                <p className="text-xs text-gray-400">{(totalAv).toLocaleString("pt-BR")} no total</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-gray-900">{nota.toFixed(1)}</span>
                <div className="flex flex-col gap-1">
                  <StarRating value={nota} size={16} />
                  <span className="text-xs text-gray-400">de 5 estrelas</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((star, idx) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${ratingDistribution[4 - idx]}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-7 text-right">{ratingDistribution[4 - idx]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabela de tickets ─────────────────────────────────────────────── */}
        <div className={`${cardStyle} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">Tickets vinculados a este produto</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50/60">
                  {["ID do Ticket", "Cliente", "Categoria", "Status", "Data"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ticketsLoading ? (
                  Array(TICKET_LIMIT).fill(null).map((_, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      {Array(5).fill(null).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : ticketsData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-gray-400">
                      Nenhum ticket vinculado a este produto.
                    </td>
                  </tr>
                ) : (
                  ticketsData?.items.map((t) => (
                    <tr key={t.id_ticket} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{t.id_ticket}</td>
                      <td className="px-5 py-3 text-gray-800 font-medium">{t.nome_cliente}</td>
                      <td className="px-5 py-3 text-gray-500 capitalize">{t.tipo_problema}</td>
                      <td className="px-5 py-3"><StatusBadge status={t.status_ticket} /></td>
                      <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(t.data_abertura)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {ticketsData && ticketsData.total > 0 && (
            <div className="px-5 py-3 flex items-center justify-between bg-blue-50/40 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Mostrando {String((ticketPage - 1) * TICKET_LIMIT + 1).padStart(2, "0")} a{" "}
                {String(Math.min(ticketPage * TICKET_LIMIT, ticketsData.total)).padStart(2, "0")} de{" "}
                {ticketsData.total} resultados
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
                  disabled={ticketPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(4, totalTicketPages) }, (_, i) => {
                  const start = Math.max(1, ticketPage - 1);
                  return start + i;
                })
                  .filter((n) => n <= totalTicketPages)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setTicketPage(n)}
                      className={[
                        "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
                        ticketPage === n
                          ? "border-2 border-blue-500 text-blue-600 bg-white"
                          : "text-gray-400 hover:bg-white",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setTicketPage((p) => p + 1)}
                  disabled={ticketPage >= totalTicketPages}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {editOpen && (
        <EditModal
          product={produto}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); navigate(0); }}
        />
      )}
      {deleteOpen && (
        <DeleteModal
          product={produto}
          onCancel={() => setDeleteOpen(false)}
          onDeleted={() => navigate("/produtos")}
        />
      )}
    </div>
  );
}
