import { useState, useMemo, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, PackageSearch } from 'lucide-react';
import { normalizeProducts } from '@/lib/product-helpers';
import Seo from '@/components/seo/Seo';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product.types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/ProductCard';

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mas relevantes' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor valorados' },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRODUCTS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Product card skeleton
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" className="w-16" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(query);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  // Map sort value to API param
  const apiSort = useMemo(() => {
    switch (sortBy) {
      case 'price-asc': return 'price_asc';
      case 'price-desc': return 'price_desc';
      case 'rating': return 'name';
      default: return undefined;
    }
  }, [sortBy]);

  // Fetch products from API with search query
  const { data: productsData, isLoading } = useProducts(
    query
      ? { search: query, page: currentPage, limit: PRODUCTS_PER_PAGE, sortBy: apiSort }
      : undefined,
  );

  const products: Product[] = useMemo(() => {
    if (!productsData?.data) return [];
    return normalizeProducts(productsData.data);
  }, [productsData]);

  const meta = productsData?.meta;
  const totalProducts = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? 1;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(`/buscar?q=${encodeURIComponent(trimmed)}`);
      setCurrentPage(1);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={query ? `Buscar: ${query}` : 'Buscar productos'}
        description={query ? `Resultados de busqueda para "${query}" en Bengala Max.` : 'Busca productos en Bengala Max.'}
        noindex
      />
      {/* Search bar header */}
      <section className="border-b border-border bg-surface py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Buscar productos..."
                icon={<Search className="h-4 w-4" />}
                aria-label="Buscar productos"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Results content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {query ? (
          <>
            {/* Title + count */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-secondary">
                  Resultados para &apos;{query}&apos;
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isLoading
                    ? 'Buscando productos...'
                    : `${totalProducts} ${totalProducts === 1 ? 'resultado encontrado' : 'resultados encontrados'}`}
                </p>
              </div>
              {!isLoading && products.length > 0 && (
                <div className="w-full sm:w-52">
                  <Select
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={handleSortChange}
                    aria-label="Ordenar por"
                  />
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-10"
                  />
                )}
              </>
            ) : (
              <EmptySearchState query={query} />
            )}
          </>
        ) : (
          /* No query provided */
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <Search className="h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-semibold text-secondary">
              Busca lo que necesites
            </h2>
            <p className="text-sm text-gray-500">
              Escribi en el buscador para encontrar productos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state sub-component
// ---------------------------------------------------------------------------

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <PackageSearch className="h-16 w-16 text-gray-300" />
      <h2 className="text-xl font-semibold text-secondary">
        No encontramos resultados para &apos;{query}&apos;
      </h2>
      <ul className="mt-2 space-y-1.5 text-sm text-gray-500">
        <li>Intenta con palabras clave diferentes</li>
        <li>Revisa que no haya errores de ortografia</li>
        <li>Usa menos palabras o terminos mas generales</li>
      </ul>
      <a
        href="/"
        className="mt-4 text-sm font-medium text-primary hover:underline"
      >
        Volver al inicio
      </a>
    </div>
  );
}
