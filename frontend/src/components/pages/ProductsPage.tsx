import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, X, Check, Trash2, ImageIcon, AlertTriangle, Search } from "lucide-react";

import ProductGrid from "../organisms/ProductGrid";
import { PageSizeSelect } from "../atoms/PageSizeSelect";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../types/product.types";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";
import api from "../../services/api"; // <-- Importação do serviço de API do seu frontend

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

// ─── Category colors ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "Automotivo": { bg: "bg-zinc-50", border: "border-zinc-200", text: "text-zinc-700" },
  "Beleza": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  "Brinquedos": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "Casa": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "Eletronicos": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "Esportes": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  "Moveis": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  "Vestuario": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
}

// ─── Shared Modal Shell ─────────────────────────────────────────────────────────

import { ArrowUp, ArrowDown } from "lucide-react";

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <div
        className="relative w-full mx-4 rounded-[32px] shadow-2xl overflow-hidden"
        style={{
          maxWidth: "588px",
          background: "#FBFBFB",
          border: "1px solid #9CA3AF",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── CategoryFilter ─────────────────────────────────────────────────────────────

interface CategoryFilterProps {
  selected: string[];
  onApply: (selected: string[]) => void;
  onClear: () => void;
  availableCategories: string[];
}

function CategoryFilter({ selected, onApply, onClear, availableCategories }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  function toggle(cat: string) {
    setDraft((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  const hasActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 px-5 py-2 rounded-full text-sm border transition-all shadow-sm cursor-pointer w-48 h-10
            ${
              open || hasActive
                ? "bg-white border-blue-500 text-gray-800"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
      >
        <span className="font-medium">Categoria</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden py-3">
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto px-1">
            {availableCategories.map((cat) => {
              const checked = draft.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      checked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(cat)}
                    className="hidden"
                  />
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getCategoryColor(cat).bg} ${
                      getCategoryColor(cat).border
                    } ${getCategoryColor(cat).text}`}
                  >
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="px-3 pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={handleApply}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Aplicar filtro
            </button>
            <button
              onClick={() => { onClear(); setDraft([]); setOpen(false); }}
              className="w-full py-2 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              Limpar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OrderFilter ─────────────────────────────────────────────────────────────

interface OrderOption {
  label: string;
  value: string;
  icon: typeof ArrowUp;
}

const ORDER_OPTIONS: OrderOption[] = [
  { label: "Mais vendido", value: "unidades_vendidas:desc", icon: ArrowUp },
  { label: "Menos vendido", value: "unidades_vendidas:asc", icon: ArrowDown },
  { label: "Maior preço", value: "preco:desc", icon: ArrowUp },
  { label: "Menor preço", value: "preco:asc", icon: ArrowDown },
  { label: "Maior avaliação", value: "media_nota_produto:desc", icon: ArrowUp },
  { label: "Menor avaliação", value: "media_nota_produto:asc", icon: ArrowDown },
  { label: "Maior receita", value: "receita_total:desc", icon: ArrowUp },
  { label: "Menor receita", value: "receita_total:asc", icon: ArrowDown },
  { label: "Maior estoque", value: "estoque_disponivel:desc", icon: ArrowUp },
  { label: "Menor estoque", value: "estoque_disponivel:asc", icon: ArrowDown },
];

function OrderFilter({ selected, onSelect, onClear }: { selected: string | null; onSelect: (val: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = ORDER_OPTIONS.find((o) => o.value === selected);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 px-5 py-2 rounded-full text-sm border transition-all shadow-sm cursor-pointer w-48 h-10
            ${
              open || selected
                ? "bg-white border-blue-500 text-gray-800"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
      >
        <span className="font-medium truncate">{selectedOption ? selectedOption.label : "Ordenar por"}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[480px] bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden py-3">
          <div className="grid grid-cols-2 divide-x divide-gray-100 max-h-[400px] overflow-y-auto">
            {ORDER_OPTIONS.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                      <opt.icon size={12} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-3 pt-3 mt-1 border-t border-gray-100">
            <button
              onClick={() => { onClear(); setOpen(false); }}
              className="w-full py-2 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              Limpar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  disabled?: boolean;
  error?: string;
  prefix?: string;
}

function Field({ label, value, onChange, type = "text", disabled = false, error, prefix }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm text-gray-800 outline-none transition-all
            focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400
            ${prefix ? "pl-8" : ""}
            ${error ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-white"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" : ""}
          `}
          style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── FormState ─────────────────────────────────────────────────────────────────

interface FormState {
  id_produto: string;
  nome_produto: string;
  categoria: string;
  preco: string;
  estoque_disponivel: string;
}

const EMPTY_FORM: FormState = {
  id_produto: "",
  nome_produto: "",
  categoria: "",
  preco: "",
  estoque_disponivel: "",
};

// ─── Modal de Edição ────────────────────────────────────────────────────────────

interface ProductFormModalProps {
  initial: FormState;
  isEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  addProduct: (data: any) => Promise<any>;
  editProduct: (id: string, data: any) => Promise<any>;
}

function ProductFormModal({ initial, isEdit, onClose, onSave, addProduct, editProduct }: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.nome_produto.trim()) e.nome_produto = "Nome obrigatório";
    if (!form.categoria.trim()) e.categoria = "Categoria obrigatória";
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) < 0)
      e.preco = "Preço inválido";
    if (form.estoque_disponivel && isNaN(Number(form.estoque_disponivel)) || Number(form.estoque_disponivel) < 0)
        e.estoque_disponivel = "Estoque inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        nome_produto: form.nome_produto.trim(),
        categoria: form.categoria.trim(),
        preco: Number(form.preco),
        estoque_disponivel: form.estoque_disponivel ? Number(form.estoque_disponivel) : 0,
      };
      if (isEdit) {
        await editProduct(form.id_produto.trim(), body);
      } else {
        await addProduct(body);
      }
      setSaved(true);
      setTimeout(() => { onSave(); }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Estado de sucesso
  if (saved) {
    return (
      <ModalShell>
        <div className="flex flex-col items-center justify-center py-14 px-8 gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}
          >
            <Check size={40} strokeWidth={2.5} className="text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-800" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              {isEdit ? "Suas edições foram salvas com sucesso!" : "Produto adicionado com sucesso!"}
            </p>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Cabeçalho */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}
        >
          <ImageIcon size={22} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="text-base font-bold"
            style={{ color: "#1E3A5F", fontFamily: "'Inter', 'Roboto', sans-serif" }}
          >
            {isEdit ? "Editar produto" : "Novo produto"}
          </h2>
          {isEdit && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-sm text-gray-500 truncate" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                {form.nome_produto || "—"}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                SKU: {form.id_produto || "—"}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Formulário */}
      <div className="px-8 py-6 flex flex-col gap-4">
        {/* Nome do produto — full width */}
        <Field
          label="Nome do produto"
          value={form.nome_produto}
          onChange={(v) => setForm((f) => ({ ...f, nome_produto: v }))}
          error={errors.nome_produto}
        />

        {/* SKU e Categoria — lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="SKU"
            value={form.id_produto}
            onChange={(v) => setForm((f) => ({ ...f, id_produto: v }))}
            disabled={true}
          />
          <Field
            label="Categoria"
            value={form.categoria}
            onChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
            error={errors.categoria}
          />
        </div>

        {/* Preço e Estoque — lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Preço (R$)"
            value={form.preco}
            onChange={(v) => setForm((f) => ({ ...f, preco: v }))}
            type="number"
            error={errors.preco}
            prefix="R$"
          />
          <Field
            label="Estoque restante"
            value={form.estoque_disponivel}
            onChange={(v) => setForm((f) => ({ ...f, estoque_disponivel: v }))}
            type="number"
            error={errors.estoque_disponivel}
          />
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-8 pb-7 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-2xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ borderColor: "#9CA3AF", fontFamily: "'Inter', 'Roboto', sans-serif" }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
          style={{ background: "#2563EB", fontFamily: "'Inter', 'Roboto', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          {saving ? (
            "Salvando..."
          ) : isEdit ? (
            <>
              <Check size={15} strokeWidth={2.5} />
              Salvar edições
            </>
          ) : (
            <>
              <Plus size={15} strokeWidth={2.5} />
              Adicionar
            </>
          )}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Modal de Deleção ───────────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  product: Product;
  onCancel: () => void;
  onConfirm: () => void;
  deleteProduct: (id: string) => Promise<void>;
}

function ConfirmDeleteModal({ product, onCancel, onConfirm, deleteProduct }: ConfirmDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await deleteProduct(product.id_produto);
      setDeleted(true);
      setTimeout(() => { onConfirm(); }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  // Estado de sucesso (deletado)
  if (deleted) {
    return (
      <ModalShell>
        <div
          className="flex flex-col items-center justify-center py-14 px-8 gap-5"
          style={{ background: "#FFF5F5" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}
          >
            <AlertTriangle size={38} strokeWidth={2} className="text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-red-700" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              Produto deletado.
            </p>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onCancel}>
      {/* Cabeçalho */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <AlertTriangle size={22} className="text-red-500" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2
            className="text-base font-bold"
            style={{ color: "#991B1B", fontFamily: "'Inter', 'Roboto', sans-serif" }}
          >
            Deseja deletar o produto?
          </h2>
          <p className="text-xs text-red-400 mt-0.5" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
            Essa ação não pode ser desfeita.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Card de resumo do produto */}
      <div className="px-8 py-6">
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
        >
          {/* Placeholder de imagem */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
          >
            <ImageIcon size={24} className="text-gray-300" />
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold text-gray-900 truncate"
              style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
            >
              {product.nome_produto}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">
                SKU: {product.id_produto}
              </span>
              {product.categoria && (
                <>
                  <span className="text-gray-200">·</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border
                      ${getCategoryColor(product.categoria).bg}
                      ${getCategoryColor(product.categoria).border}
                      ${getCategoryColor(product.categoria).text}`}
                  >
                    {product.categoria}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-1.5" style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              {formatCurrency(product.preco)}
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-8 pb-7 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ borderColor: "#9CA3AF", fontFamily: "'Inter', 'Roboto', sans-serif" }}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
          style={{ background: "#DC2626", fontFamily: "'Inter', 'Roboto', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
        >
          {deleting ? (
            "Deletando..."
          ) : (
            <>
              <Trash2 size={15} strokeWidth={2} />
              Deletar
            </>
          )}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────────

export default function ProductsPage() {
  const navigate = useNavigate();
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchCommitted, setSearchCommitted] = useState<string>("");

  // Novo estado controlado para a lista completa de categorias do filtro
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.keys(CATEGORY_COLORS));

  // Função assíncrona responsável por consultar a rota /categorias do backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/produto/categorias");
      const fromDb = res.data || [];
      const predefined = Object.keys(CATEGORY_COLORS);
      
      // Mescla as categorias predefinidas esteticamente com as existentes no banco
      setAvailableCategories(Array.from(new Set([...predefined, ...fromDb])).sort());
    } catch (err) {
      console.error("Erro ao carregar categorias do banco de dados:", err);
    }
  }, []);

  function handleSearch() {
    setSearchCommitted(searchInput.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchCommitted("");
    setPage(1);
  }

  const { data: products, loading, error, page, setPage, limit, setLimit, refetch, addProduct, editProduct, deleteProduct } =
    useProducts({
      page: 1,
      limit: 12,
      categorias: categoriasSelecionadas,
      nome_produto: searchCommitted || null,
      ordem: ordemSelecionada,
    });

  // Dispara a consulta assim que o componente for montado em tela
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() { setFormModal({ open: true, product: null }); }
  function openEdit(product: Product) { setFormModal({ open: true, product }); }
  function closeForm() { setFormModal({ open: false, product: null }); }
  
  function handleSaved() { 
    closeForm(); 
    refetch(); 
    fetchCategories(); // <-- Re-requisita do banco para capturar se uma nova categoria foi criada
  }
  
  function handleDeleted() { 
    setDeleteModal(null); 
    refetch(); 
    fetchCategories(); // <-- Atualiza a lista caso a última unidade pertencente àquela categoria tenha sumido
  }

  const editInitial: FormState = formModal.product
    ? {
      id_produto: formModal.product.id_produto,
      nome_produto: formModal.product.nome_produto ?? "",
      categoria: formModal.product.categoria ?? "",
      preco: String(formModal.product.preco ?? ""),
      estoque_disponivel: String(formModal.product.estoque_disponivel ?? ""),
    }
    : EMPTY_FORM;

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <div className="mx-auto w-full max-w-screen-xl px-8 pb-12">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
              Catálogo de produtos
            </h1>
            <p className="mt-1 text-sm text-gray-400">Produtos disponíveis para compra atualmente</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Adicionar produto
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Barra de pesquisa */}
          <div className="relative flex-1">
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Search size={16} />
            </button>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value;
                setSearchInput(v);
                setSearchCommitted(v.trim());
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Pesquisar por nome do produto"
              className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 shadow-sm"
              style={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ordenação */}
          <OrderFilter
            selected={ordemSelecionada}
            onSelect={(val) => {
              setOrdemSelecionada(val);
              setPage(1);
            }}
            onClear={() => {
              setOrdemSelecionada(null);
              setPage(1);
            }}
          />

          {/* Filtro de categorias */}
          <CategoryFilter
            availableCategories={availableCategories}
            selected={categoriasSelecionadas}
            onApply={(cats) => {
              setCategoriasSelecionadas(cats);
              setPage(1);
            }}
            onClear={() => {
              setCategoriasSelecionadas([]);
              setPage(1);
            }}
          />
        </div>

        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(limit).fill(null).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                  <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-300 rounded animate-pulse" />
                  <div className="flex gap-2 mt-auto">
                    <div className="flex-1 h-8 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="flex-1 h-8 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 && (
                <div className="py-20 text-center text-sm text-gray-400">Nenhum produto encontrado.</div>
              )}
              <ProductGrid
                products={products as Product[]}
                onNavigate={(product) => navigate(`/produtos/${product.id_produto}`)}
              />
            </>
          )}

          {products.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
              <span className="text-xs text-gray-400">
                {`Mostrando ${String((page - 1) * limit + 1).padStart(2, "0")} a ${String((page - 1) * limit + products.length).padStart(2, "0")} resultados`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: 5 }, (_, i) => {
                  const start = Math.max(1, page - 2);
                  return start + i;
                }).filter((n) => products.length === limit || n <= page).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={[
                      "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
                      page === n
                        ? "border-2 border-blue-500 text-blue-600 bg-white"
                        : "text-gray-400 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={products.length < limit}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>

                <div className="ml-2">
                  <PageSizeSelect
                    value={limit}
                    onChange={(size) => { setLimit(size); setPage(1); }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div className="mt-4 text-red-600 text-sm">Erro ao carregar produtos: {error}</div>}
        </div>
      </div>

      {formModal.open && (
        <ProductFormModal
          initial={editInitial}
          isEdit={formModal.product !== null}
          onClose={closeForm}
          onSave={handleSaved}
          addProduct={addProduct}
          editProduct={editProduct}
        />
      )}

      {deleteModal && (
        <ConfirmDeleteModal
          product={deleteModal}
          onCancel={() => setDeleteModal(null)}
          onConfirm={handleDeleted}
          deleteProduct={deleteProduct}
        />
      )}
    </div>
  );
}