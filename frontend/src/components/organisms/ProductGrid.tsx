import ProductCard from "../molecules/ProductCard";
import type { Product } from "../types/product.types";

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onNavigate: (product: Product) => void;
}

export function ProductGrid({ products, onEdit, onDelete, onNavigate }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id_produto} product={p} onEdit={onEdit} onDelete={onDelete} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export default ProductGrid;