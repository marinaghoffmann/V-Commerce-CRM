import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Navbar } from "../organisms/Navbar";
import ProductGrid from "../organisms/ProductGrid";
import { PageHeader } from "../molecules/TitleHeaeder";
import { FilterBar } from "../molecules/FilterBar";
import { PageSizeSelect } from "../atoms/PageSizeSelect";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../types/product.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const FILTERS = ["Todos"];

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
}

function ProductFormModal({ initial, isEdit, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.id_produto.trim()) e.id_produto = "ID obrigatório";
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
      const url = isEdit
        ? `${BASE_URL}/produto/${form.id_produto}`
        : `${BASE_URL}/produto/`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function field(
    label: string,
    key: keyof FormState,
    type = "text",
    disabled = false
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <input
          type={type}
          value={form[key]}
          disabled={disabled}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none transition-colors
            focus:ring-2 focus:ring-blue-400 focus:border-transparent
            ${errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
        />
        {errors[key] && <span className="text-xs text-red-500">{errors[key]}</span>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {field("ID do produto", "id_produto", "text", isEdit)}
          {field("Nome", "nome_produto")}
          {field("Categoria", "categoria")}
          {field("Preço (R$)", "preco", "number")}
          {field("Estoque disponível", "estoque_disponivel", "number")}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
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
}

function ConfirmDeleteModal({ product, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/produto/${product.id_produto}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Remover produto</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tem certeza que deseja remover <span className="font-semibold text-gray-800">{product.nome_produto}</span>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Removendo..." : "Sim, remover"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchField, setSearchField] = useState("nome_produto");
  const [formModal, setFormModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);

  const { data: products, loading, error, page, setPage, limit, setLimit, refetch } =
    useProducts({ page: 1, limit: 12 });

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [searchInput, setPage]);

  function openCreate() {
    setFormModal({ open: true, product: null });
  }

  function openEdit(product: Product) {
    setFormModal({ open: true, product });
  }

  function closeForm() {
    setFormModal({ open: false, product: null });
  }

  function handleSaved() {
    closeForm();
    refetch();
  }

  function handleDeleted() {
    setDeleteModal(null);
    refetch();
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
    <div className="p-4">
      <Navbar />

      <div className="mx-auto w-full max-w-screen-2xl px-10">
        <div className="flex items-center justify-between">
          <PageHeader title="Catálogo de produtos" subtitle="Explore e filtre seus produtos" />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Novo produto
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchField={searchField}
            onSearchFieldChange={(f) => {
              setSearchField(f);
              setSearchInput("");
            }}
            activeFilter={"Todos"}
            onFilterChange={() => {}}
            filters={FILTERS}
          />
        </div>

        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          <ProductGrid
            products={products as Product[]}
            onEdit={openEdit}
            onDelete={setDeleteModal}
          />

          <div className="mt-6 flex items-center justify-between rounded-xl border-t border-gray-100 bg-white px-4 py-3">
            <span className="text-xs text-gray-400">
              {products.length === 0
                ? "0 resultados"
                : `${(page - 1) * limit + 1}–${(page - 1) * limit + products.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white">
                {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={products.length < limit}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
              <div className="ml-2">
                <PageSizeSelect
                  value={limit}
                  onChange={(size) => {
                    setLimit(size);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {error && <div className="mt-4 text-red-600">Erro ao carregar produtos: {error}</div>}
        </div>
      </div>

      {formModal.open && (
        <ProductFormModal
          initial={editInitial}
          isEdit={formModal.product !== null}
          onClose={closeForm}
          onSave={handleSaved}
        />
      )}

      {deleteModal && (
        <ConfirmDeleteModal
          product={deleteModal}
          onCancel={() => setDeleteModal(null)}
          onConfirm={handleDeleted}
        />
      )}
    </div>
  );
}