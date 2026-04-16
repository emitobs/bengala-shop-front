import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSearchProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import {
  getProductImageUrl,
  normalizeProducts,
} from '@/lib/product-helpers';

interface SearchDropdownProps {
  query: string;
  onSelect: () => void;
  className?: string;
}

export default function SearchDropdown({
  query,
  onSelect,
  className = '',
}: SearchDropdownProps) {
  const debouncedQuery = useDebounce(query.trim(), 300);
  const { data, isLoading, isFetching } = useSearchProducts(debouncedQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const products = data?.data ? normalizeProducts(data.data).slice(0, 5) : [];
  const showDropdown = debouncedQuery.length >= 2;

  if (!showDropdown) return null;

  const loading = isLoading || isFetching;

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-xl shadow-secondary/10 ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-secondary-light">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando...
        </div>
      ) : products.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-secondary-light">
          No se encontraron productos para "{debouncedQuery}"
        </div>
      ) : (
        <>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/producto/${product.slug}`}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5"
                >
                  <img
                    src={getProductImageUrl(product.images, product.name)}
                    alt={product.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-secondary">
                      {product.name}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      ${product.basePrice.toLocaleString('es-UY')}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={`/buscar?q=${encodeURIComponent(debouncedQuery)}`}
            onClick={onSelect}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Ver todos los resultados
          </Link>
        </>
      )}
    </div>
  );
}
