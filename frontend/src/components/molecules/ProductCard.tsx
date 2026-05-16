import type { Product } from "../types/product.types";
import { Pencil, Trash2 } from "lucide-react";

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? "text-yellow-400" : "text-gray-200"}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.011 4.665 24 6 15.595 0 9.748l8.332-1.73z" />
        </svg>
      ))}
    </div>
  );
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
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug flex-1">{product.nome_produto}</h3>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          {product.categoria ?? "—"}
        </span>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-mono rounded-full">
          SKU: {product.id_produto}
        </span>
      </div>

      {/* Preço e avaliação */}
      <div>
        <div className="text-xl font-bold text-gray-900">{formatCurrency(product.preco)}</div>
        <div className="flex items-center gap-2 mt-1">
          <StarRating value={product.media_nota_produto ?? 0} />
          <span className="text-xs text-gray-400">
            {product.media_nota_produto?.toFixed(1) ?? "0.0"} ({product.total_avaliacoes ?? 0})
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Unidades vendidas</span>
          <span className="text-xs font-semibold text-gray-700">{sold.toLocaleString("pt-BR")} ({percent}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Receita</div>
          <div className="text-sm font-semibold text-gray-800">{formatCurrency(product.receita_total)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-0.5">Estoque restante</div>
          <div className="text-sm font-semibold text-gray-800">{stock.toLocaleString("pt-BR")} un.</div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;