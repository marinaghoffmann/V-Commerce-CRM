import { useEffect, useRef, useState, useMemo } from "react"; // Adicionado useMemo
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

import ProductGrid from "../organisms/ProductGrid";
import { PageSizeSelect } from "../atoms/PageSizeSelect";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../types/product.types";

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

// ─── Dropdown de Categoria (AGORA RECEBE CATEGORIAS DINÂMICAS) ──────────────────

interface CategoryFilterProps {
  selected: string[];
  onApply: (selected: string[]) => void;
  availableCategories: string[]; // Nova prop para as categorias dinâmicas
}

function CategoryFilter({ selected, onApply, availableCategories }: CategoryFilterProps) {
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

  useEffect(() => { setDraft(selected); }, [selected]);

  function toggle(cat: string) {
    setDraft((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  const hasActive = selected.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all shadow-sm
            ${hasActive
              ? "bg-blue-500 border-blue-500 text-white font-semibold"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
        >
          Categoria
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Categorias</span>
              {draft.length > 0 && (
                <button onClick={() => setDraft([])} className="text-xs text-blue-500 hover:underline">
                  Limpar
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {availableCategories.map((cat) => {
                const color = getCategoryColor(cat);
                const checked = draft.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(cat)}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.border} ${color.text}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={handleApply}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Aplicar filtro
              </button>
            </div>
          </div>
        )}
      </div>

      {selected.map((cat) => {
        const color = getCategoryColor(cat);
        return (
          <span
            key={cat}
            className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-xs font-medium border ${color.bg} ${color.border} ${color.text}`}
          >
            {cat}
            <button
              onClick={() => onApply(selected.filter((c) => c !== cat))}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        );
      })}
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
}

function Field({ label, value, onChange, type = "text", disabled = false, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors
          focus:ring-2 focus:ring-blue-400 focus:border-transparent
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}
          ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Formulário ────────────────────────────────────────────────────────────────

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

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.nome_produto.trim()) e.nome_produto = "Nome obrigatório";
    if (!form.categoria.trim()) e.categoria = "Categoria obrigatória";
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) < 0)
      e.preco = "Preço inválido";
    if (form.estoque_disponivel && isNaN(Number(form.estoque_disponivel)))
      e.estoque_disponivel = "Estoque inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        id_produto: form.id_produto.trim(),
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
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Campo de ID só aparece na edição (somente leitura) */}
          {isEdit && (
            <Field
              label="ID do produto"
              value={form.id_produto}
              onChange={(v) => setForm((f) => ({ ...f, id_produto: v }))}
              disabled={true}
            />
          )}
          <Field
            label="Nome"
            value={form.nome_produto}
            onChange={(v) => setForm((f) => ({ ...f, nome_produto: v }))}
            error={errors.nome_produto}
          />
          <Field
            label="Categoria"
            value={form.categoria}
            onChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
            error={errors.categoria}
          />
          <Field
            label="Preço (R$)"
            value={form.preco}
            onChange={(v) => setForm((f) => ({ ...f, preco: v }))}
            type="number"
            error={errors.preco}
          />
          <Field
            label="Estoque disponível"
            value={form.estoque_disponivel}
            onChange={(v) => setForm((f) => ({ ...f, estoque_disponivel: v }))}
            type="number"
            error={errors.estoque_disponivel}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de confirmação ───────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  product: Product;
  onCancel: () => void;
  onConfirm: () => void;
  deleteProduct: (id: string) => Promise<void>;
}

function ConfirmDeleteModal({ product, onCancel, onConfirm, deleteProduct }: ConfirmDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await deleteProduct(product.id_produto);
      onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Remover produto</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tem certeza que deseja remover{" "}
          <span className="font-semibold text-gray-800">{product.nome_produto}</span>?
          Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
            {deleting ? "Removendo..." : "Sim, remover"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [formModal, setFormModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);

  const { data: products, loading, error, page, setPage, limit, setLimit, refetch, addProduct, editProduct, deleteProduct } =
    useProducts({ page: 1, limit: 12, categorias: categoriasSelecionadas });

  // ─── LOGICA DE CATEGORIAS DINÂMICAS ───
  const availableCategories = useMemo(() => {
    // 1. Pega as categorias padrão definidas no objeto de cores
    const predefined = Object.keys(CATEGORY_COLORS);
    // 2. Extrai categorias únicas que existem no array de produtos vindo do banco
    const fromData = products
      .map((p) => p.categoria)
      .filter((c): c is string => !!c); // Remove valores nulos ou vazios

    // 3. Junta tudo num Set para remover duplicados e ordena alfabeticamente
    return Array.from(new Set([...predefined, ...fromData])).sort();
  }, [products]);

  function openCreate() { setFormModal({ open: true, product: null }); }
  function openEdit(product: Product) { setFormModal({ open: true, product }); }
  function closeForm() { setFormModal({ open: false, product: null }); }
  function handleSaved() { closeForm(); refetch(); }
  function handleDeleted() { setDeleteModal(null); refetch(); }

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
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Novo produto
          </button>
        </div>

        <div className="mb-6">
          <CategoryFilter
            availableCategories={availableCategories} // Passando a lista dinâmica aqui
            selected={categoriasSelecionadas}
            onApply={(cats) => {
              setCategoriasSelecionadas(cats);
              setPage(1);
            }}
          />
        </div>

        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          {!loading && products.length === 0 && (
            <div className="py-20 text-center text-sm text-gray-400">Nenhum produto encontrado.</div>
          )}

          <ProductGrid
            products={products as Product[]}
            onEdit={openEdit}
            onDelete={setDeleteModal}
          />

          {products.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
              <span className="text-xs text-gray-400">
                {`${(page - 1) * limit + 1}–${(page - 1) * limit + products.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-xs font-semibold text-white">
                  {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={products.length < limit}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
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