import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { normalizeProducts, normalizeCategory } from '@/lib/product-helpers';
import { useCategoryBySlug, useProducts } from '@/hooks/useProducts';
import type { Category, Product } from '@/types/product.types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Rating from '@/components/ui/Rating';
import Drawer from '@/components/ui/Drawer';
import ProductCard from '@/components/product/ProductCard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRODUCTS_PER_PAGE = 12;

const PRICE_RANGES = [
  { value: 'all', label: 'Todos los precios' },
  { value: '0-1000', label: 'Hasta $1.000' },
  { value: '1000-3000', label: '$1.000 - $3.000' },
  { value: '3000-5000', label: '$3.000 - $5.000' },
  { value: '5000+', label: 'Mas de $5.000' },
] as const;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mas relevantes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Mas recientes' },
  { value: 'rating', label: 'Mejor calificados' },
];

const RATING_FILTERS = [
  { value: 4, label: '4+ estrellas' },
  { value: 3, label: '3+ estrellas' },
] as const;

// ---------------------------------------------------------------------------
// Collapsible filter section
// ---------------------------------------------------------------------------

function FilterSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold text-secondary mb-3 group"
      >
        <span className="group-hover:text-primary transition-colors duration-150">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors duration-150" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors duration-150" />
        )}
      </button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter content (shared between sidebar and drawer)
// ---------------------------------------------------------------------------

interface FilterContentProps {
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  selectedMinRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  subcategories: Category[];
  currentSlug: string;
}

function FilterContent({
  selectedPriceRange,
  onPriceRangeChange,
  selectedMinRating,
  onMinRatingChange,
  onClearAll,
  activeFilterCount,
  subcategories,
  currentSlug,
}: FilterContentProps) {
  return (
    <div>
      {/* Active filter count + clear */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
          <span className="text-sm text-gray-500">
            {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''} activo{activeFilterCount !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-150"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <FilterSection title="Subcategorias">
          <div className="space-y-1">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/categorias/${sub.slug}`}
                className={cn(
                  'flex items-center gap-2 rounded-button px-3 py-2 text-sm transition-colors duration-150',
                  sub.slug === currentSlug
                    ? 'bg-primary-light text-primary font-medium'
                    : 'hover:bg-gray-50 text-gray-600',
                )}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection title="Precio">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.value}
              className={cn(
                'flex items-center gap-3 rounded-button px-3 py-2 cursor-pointer',
                'transition-colors duration-150',
                selectedPriceRange === range.value
                  ? 'bg-primary-light text-primary font-medium'
                  : 'hover:bg-gray-50 text-gray-600',
              )}
            >
              <input
                type="radio"
                name="priceRange"
                value={range.value}
                checked={selectedPriceRange === range.value}
                onChange={() => onPriceRangeChange(range.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                  selectedPriceRange === range.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300',
                )}
              >
                {selectedPriceRange === range.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Calificacion">
        <div className="space-y-1">
          {RATING_FILTERS.map((rf) => {
            const isSelected = selectedMinRating === rf.value;
            return (
              <label
                key={rf.value}
                className={cn(
                  'flex items-center gap-3 rounded-button px-3 py-2 cursor-pointer',
                  'transition-colors duration-150',
                  isSelected
                    ? 'bg-primary-light text-primary font-medium'
                    : 'hover:bg-gray-50 text-gray-600',
                )}
              >
                <input
                  type="radio"
                  name="minRating"
                  checked={isSelected}
                  onChange={() => onMinRatingChange(isSelected ? null : rf.value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-gray-300',
                  )}
                >
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  <Rating value={rf.value} size="sm" readOnly />
                  <span className="text-sm">y mas</span>
                </div>
              </label>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product card skeleton
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
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

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  // Filter state
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch category info
  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useCategoryBySlug(slug ?? '');

  // The category endpoint returns the category object directly
  const category: Category | null = useMemo(() => {
    if (!categoryData) return null;
    const raw = (categoryData as any).category ?? categoryData;
    return normalizeCategory(raw);
  }, [categoryData]);

  // Parse price range into min/max
  const parsedPriceRange = useMemo(() => {
    if (selectedPriceRange === 'all') return { minPrice: undefined, maxPrice: undefined };
    if (selectedPriceRange === '5000+') return { minPrice: 5000, maxPrice: undefined };
    const [min, max] = selectedPriceRange.split('-').map(Number);
    return { minPrice: min, maxPrice: max };
  }, [selectedPriceRange]);

  // Map sort value to API param
  const apiSort = useMemo(() => {
    switch (sortBy) {
      case 'price-asc': return 'price_asc';
      case 'price-desc': return 'price_desc';
      case 'rating': return 'name';
      case 'newest': return 'newest';
      default: return undefined;
    }
  }, [sortBy]);

  // Fetch products for this category
  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useProducts(
    slug
      ? {
          categorySlug: slug,
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          sortBy: apiSort,
          minPrice: parsedPriceRange.minPrice,
          maxPrice: parsedPriceRange.maxPrice,
        }
      : undefined,
  );

  const products: Product[] = useMemo(() => {
    if (!productsData?.data) return [];
    return normalizeProducts(productsData.data);
  }, [productsData]);

  const meta = productsData?.meta;
  const totalProducts = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? 1;

  // Subcategories from category data
  const subcategories: Category[] = category?.children ?? [];

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedPriceRange !== 'all') count += 1;
    if (selectedMinRating !== null) count += 1;
    return count;
  }, [selectedPriceRange, selectedMinRating]);

  // Handlers
  const handlePriceRangeChange = useCallback((range: string) => {
    setSelectedPriceRange(range);
    setCurrentPage(1);
  }, []);

  const handleMinRatingChange = useCallback((rating: number | null) => {
    setSelectedMinRating(rating);
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedPriceRange('all');
    setSelectedMinRating(null);
    setCurrentPage(1);
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter props
  const filterProps: FilterContentProps = {
    selectedPriceRange,
    onPriceRangeChange: handlePriceRangeChange,
    selectedMinRating,
    onMinRatingChange: handleMinRatingChange,
    onClearAll: handleClearAll,
    activeFilterCount,
    subcategories,
    currentSlug: slug ?? '',
  };

  // ---- Loading state ----
  if (isLoadingCategory) {
    return (
      <div className="min-h-screen bg-background">
        <div
          className="py-12 md:py-16"
          style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #FF4081 100%)' }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Skeleton variant="text" className="h-10 w-64 bg-white/20" />
            <Skeleton variant="text" className="h-5 w-96 mt-3 bg-white/10" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Not found state ----
  if (categoryError || !category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-2">
          <AlertCircle className="h-10 w-10 text-error" />
        </div>
        <h1 className="text-3xl font-bold text-secondary">
          Categoria no encontrada
        </h1>
        <p className="text-gray-500">
          La categoria que buscas no existe o fue eliminada.
        </p>
        <Link
          to="/"
          className="mt-2 text-primary font-medium hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/productos' },
    { label: category.name },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <section
        className="py-12 md:py-16"
        style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #FF4081 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Toolbar: count + mobile filter + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              {isLoadingProducts
                ? 'Cargando productos...'
                : `${totalProducts} ${totalProducts === 1 ? 'producto' : 'productos'}`}
            </p>

            {/* Mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
          <div className="w-full sm:w-52">
            <Select
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={handleSortChange}
              aria-label="Ordenar por"
            />
          </div>
        </div>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {selectedPriceRange !== 'all' && (
              <button
                type="button"
                onClick={() => handlePriceRangeChange('all')}
                className="inline-flex items-center gap-1 rounded-full bg-primary-light text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors duration-150"
              >
                {PRICE_RANGES.find((r) => r.value === selectedPriceRange)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
            {selectedMinRating !== null && (
              <button
                type="button"
                onClick={() => handleMinRatingChange(null)}
                className="inline-flex items-center gap-1 rounded-full bg-primary-light text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors duration-150"
              >
                {selectedMinRating}+ estrellas
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-gray-500 hover:text-primary transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Main content: sidebar + grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-card bg-surface border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-secondary">Filtros</h2>
              </div>
              <FilterContent {...filterProps} />
            </div>
          </aside>

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Product grid */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Package className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  No hay productos
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  {activeFilterCount > 0
                    ? 'No se encontraron productos con los filtros seleccionados.'
                    : 'No hay productos en esta categoria todavia.'}
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-10"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <Drawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filtros"
      >
        <FilterContent {...filterProps} />
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setMobileFiltersOpen(false)}
          >
            Ver {totalProducts} resultado{totalProducts !== 1 ? 's' : ''}
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
