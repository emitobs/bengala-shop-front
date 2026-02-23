import { useState, useMemo, useCallback } from 'react';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { normalizeProducts } from '@/lib/product-helpers';
import { useProducts, useCategories } from '@/hooks/useProducts';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Rating from '@/components/ui/Rating';
import Drawer from '@/components/ui/Drawer';
import Skeleton from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/ProductCard';
import type { Category } from '@/types/product.types';

// Category type re-used in FilterContentProps

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 12;

const PRICE_RANGES = [
  { value: 'all', label: 'Todos los precios' },
  { value: '0-1000', label: 'Hasta $1.000' },
  { value: '1000-3000', label: '$1.000 - $3.000' },
  { value: '3000-5000', label: '$3.000 - $5.000' },
  { value: '5000+', label: 'Mas de $5.000' },
] as const;

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Mas relevantes' },
  { value: 'name-asc', label: 'A - Z' },
  { value: 'name-desc', label: 'Z - A' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Mas nuevos' },
] as const;

const RATING_FILTERS = [
  { value: 4, label: '4+ estrellas' },
  { value: 3, label: '3+ estrellas' },
] as const;

// ---------------------------------------------------------------------------
// Filter sidebar content (shared between desktop sidebar and mobile drawer)
// ---------------------------------------------------------------------------

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
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
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface FilterContentProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (slug: string) => void;
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  selectedMinRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

function FilterContent({
  categories,
  selectedCategories,
  onToggleCategory,
  selectedPriceRange,
  onPriceRangeChange,
  selectedMinRating,
  onMinRatingChange,
  onClearAll,
  activeFilterCount,
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

      {/* Categories */}
      <FilterSection title="Categoria">
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.id}
                className={cn(
                  'flex items-center gap-3 rounded-button px-3 py-2 cursor-pointer',
                  'transition-colors duration-150',
                  isChecked
                    ? 'bg-primary-light text-primary font-medium'
                    : 'hover:bg-gray-50 text-gray-600',
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(cat.slug)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all duration-150',
                    isChecked
                      ? 'border-primary bg-primary'
                      : 'border-gray-300',
                  )}
                >
                  {isChecked && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-sm">{cat.name}</span>
              </label>
            );
          })}
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
                  onChange={() =>
                    onMinRatingChange(isSelected ? null : rf.value)
                  }
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
// Main page component
// ---------------------------------------------------------------------------

export default function ProductListPage() {
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse price range into min/max
  const parsedPriceRange = useMemo(() => {
    if (selectedPriceRange === 'all') return { minPrice: undefined, maxPrice: undefined };
    if (selectedPriceRange === '5000+') return { minPrice: 5000, maxPrice: undefined };
    const [min, max] = selectedPriceRange.split('-').map(Number);
    return { minPrice: min, maxPrice: max };
  }, [selectedPriceRange]);

  // Map sort value to API sort param
  const apiSort = useMemo(() => {
    switch (sortBy) {
      case 'name-asc': return 'name';
      case 'name-desc': return 'name_desc';
      case 'price-asc': return 'price_asc';
      case 'price-desc': return 'price_desc';
      case 'newest': return 'newest';
      default: return undefined;
    }
  }, [sortBy]);

  // Fetch categories for filter sidebar
  const { data: categories = [] } = useCategories();

  // Fetch products from API with all filter params
  const { data: productsData, isLoading, error } = useProducts({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    categorySlug: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    minPrice: parsedPriceRange.minPrice,
    maxPrice: parsedPriceRange.maxPrice,
    sortBy: apiSort,
  });

  const products = productsData ? normalizeProducts(productsData.data) : [];

  const meta = productsData?.meta;
  const totalProducts = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? 1;

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedPriceRange !== 'all') count += 1;
    if (selectedMinRating !== null) count += 1;
    return count;
  }, [selectedCategories, selectedPriceRange, selectedMinRating]);

  // Toggle category (use slug instead of id for API)
  const handleToggleCategory = useCallback((catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((s) => s !== catSlug)
        : [...prev, catSlug],
    );
    setCurrentPage(1);
  }, []);

  // Price range change
  const handlePriceRangeChange = useCallback((range: string) => {
    setSelectedPriceRange(range);
    setCurrentPage(1);
  }, []);

  // Rating change
  const handleMinRatingChange = useCallback((rating: number | null) => {
    setSelectedMinRating(rating);
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriceRange('all');
    setSelectedMinRating(null);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Filter content props
  const filterProps: FilterContentProps = {
    categories,
    selectedCategories,
    onToggleCategory: handleToggleCategory,
    selectedPriceRange,
    onPriceRangeChange: handlePriceRangeChange,
    selectedMinRating,
    onMinRatingChange: handleMinRatingChange,
    onClearAll: handleClearAll,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Productos' },
          ]}
          className="mb-6"
        />

        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary tracking-tight">
                Productos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading
                  ? 'Cargando productos...'
                  : `${totalProducts} producto${totalProducts !== 1 ? 's' : ''} encontrado${totalProducts !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar productos..."
              className={cn(
                'w-full rounded-input border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-secondary',
                'placeholder:text-gray-400',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: mobile filter button + sort */}
        <div className="flex items-center justify-between gap-4 mb-6">
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

          {/* Sort dropdown */}
          <div className="ml-auto flex items-center gap-3">
            <Select
              options={SORT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-52 text-sm"
            />
          </div>
        </div>

        {/* Main content: sidebar + grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-card bg-surface border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-secondary">Filtros</h2>
              </div>
              <FilterContent {...filterProps} />
            </div>
          </aside>

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {selectedCategories.map((catSlug) => {
                  const cat = categories.find((c) => c.slug === catSlug);
                  if (!cat) return null;
                  return (
                    <button
                      key={catSlug}
                      type="button"
                      onClick={() => handleToggleCategory(catSlug)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-light text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors duration-150"
                    >
                      {cat.name}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
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
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
                  <AlertCircle className="h-10 w-10 text-error" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-1">
                  Error al cargar los productos
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Ocurrio un error al buscar los productos. Intenta de nuevo.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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
                  No se encontraron productos
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Intenta ajustar los filtros o la busqueda para encontrar lo que necesitas.
                </p>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Limpiar filtros
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
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
