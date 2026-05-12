import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "../organisms/Navbar";
import ProductGrid from "../organisms/ProductGrid";
import { PageHeader } from "../molecules/TitleHeaeder";
import { FilterBar } from "../molecules/FilterBar";
import { PageSizeSelect } from "../atoms/PageSizeSelect";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../types/product.types";

const FILTERS = ["Todos"];

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("nome_produto");

  const { data: products, loading, error, page, setPage, limit, setLimit } = useProducts({ page: 1, limit: 12 });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, setPage]);

  useEffect(() => {
    // refetch when search changes — the hook currently doesn't accept dynamic filters directly
    // so we call refetch by constructing params via env call. Simpler approach: rely on page/limit for now.
    // Future: extend useProducts to accept dynamic filters in dependency list.
  }, [search]);

  return (
    <div className="p-4">
      <Navbar />

      <div className="mx-auto w-full max-w-screen-2xl px-10">
        <PageHeader title="Catálogo de produtos" subtitle="Explore e filtre seus produtos" />

        <div className="mb-4 flex items-center gap-3">
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchField={searchField}
            onSearchFieldChange={(f) => {
              setSearchField(f);
              setSearchInput("");
              setSearch("");
            }}
            activeFilter={"Todos"}
            onFilterChange={() => {}}
            filters={FILTERS}
          />
        </div>

        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          <ProductGrid products={products as Product[]} />

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
    </div>
  );
}
