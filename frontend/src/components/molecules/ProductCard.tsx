import type { Product } from "../types/product.types";
import { Pencil, Trash2 } from "lucide-react";

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const sold = product.unidades_vendidas ?? 0;
  const stock = product.estoque_disponivel ?? 0;
  const denom = sold + stock || 1;
  const percent = Math.round((sold / denom) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7l3 12h12l3-12" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{product.nome_produto}</h3>
            <span className="text-sm text-gray-500">SKU-{product.id_produto}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 border rounded-md text-sm text-gray-600">{product.categoria ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-semibold text-gray-900">{formatCurrency(product.preco)}</div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.011 4.665 24 6 15.595 0 9.748l8.332-1.73z"/>
          </svg>
          <span>{product.media_nota_produto ?? 0} ({product.total_avaliacoes ?? 0})</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">Unidades vendidas</div>
      <div className="mt-1 flex items-center gap-3">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black" style={{ width: `${percent}%` }} />
        </div>
        <div className="text-sm text-gray-700 w-16 text-right">{sold.toLocaleString()} ({percent}%)</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>
          <div className="text-xs text-gray-500">Receita</div>
          <div className="font-medium">{formatCurrency(product.receita_total)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Estoque restante</div>
          <div className="font-medium">{stock ?? 0} un.</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Pencil size={14} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          Remover
        </button>
      </div>
    </div>
  );
}

export default ProductCard;