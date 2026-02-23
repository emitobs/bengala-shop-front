import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import { formatUYU } from '@/lib/format-currency';
import { cn } from '@/lib/cn';
import {
  useAdminProducts,
  useDeleteProduct,
  useUpdateProduct,
  useAdminCategories,
} from '@/hooks/useAdmin';

const PRODUCTS_PER_PAGE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

const STOCK_OPTIONS = [
  { value: '', label: 'Todo el stock' },
  { value: 'in_stock', label: 'Con stock' },
  { value: 'low_stock', label: 'Stock bajo' },
  { value: 'out_of_stock', label: 'Sin stock' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Mas recientes' },
  { value: 'name', label: 'Nombre A-Z' },
  { value: 'price_asc', label: 'Precio menor' },
  { value: 'price_desc', label: 'Precio mayor' },
];

function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none rounded-input border bg-white px-3 py-2 pr-8 text-sm text-secondary',
          'transition-colors cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'hover:border-gray-400',
          value ? 'border-primary/40 text-primary font-medium' : 'border-border',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categorySlug, setCategorySlug] = useState('');
  const [isActive, setIsActive] = useState('');
  const [stockFilter, setStockFilter] = useState(searchParams.get('stockFilter') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'name');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: searchQuery || undefined,
    categorySlug: categorySlug || undefined,
    isActive: isActive || undefined,
    stockFilter: stockFilter || undefined,
    sortBy: sortBy || undefined,
  });

  const { data: categories = [] } = useAdminCategories();
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !currentActive } });
  };

  const products = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const totalProducts = meta?.total ?? 0;

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget, {
        onSettled: () => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
      });
    }
  };

  const hasActiveFilters =
    searchQuery || categorySlug || isActive || stockFilter || sortBy;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSearchInput('');
    setCategorySlug('');
    setIsActive('');
    setStockFilter('');
    setSortBy('');
    setCurrentPage(1);
  };

  const categoryOptions = [
    { value: '', label: 'Todas las categorias' },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar productos. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Productos</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {totalProducts.toLocaleString('es-UY')} producto{totalProducts !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/productos/nuevo')}
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="space-y-3">
          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar por nombre o SKU..."
                className="w-full rounded-input border border-border bg-white py-2 pl-9 pr-3 text-sm text-secondary outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button variant="ghost" size="md" onClick={handleSearch}>
              Buscar
            </Button>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={categorySlug}
              onChange={(val) => { setCategorySlug(val); setCurrentPage(1); }}
              options={categoryOptions}
              className="min-w-[160px]"
            />
            <FilterSelect
              value={isActive}
              onChange={(val) => { setIsActive(val); setCurrentPage(1); }}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              value={stockFilter}
              onChange={(val) => { setStockFilter(val); setCurrentPage(1); }}
              options={STOCK_OPTIONS}
            />
            <FilterSelect
              value={sortBy}
              onChange={(val) => { setSortBy(val); setCurrentPage(1); }}
              options={SORT_OPTIONS}
            />
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 rounded-input px-2.5 py-2 text-sm text-primary hover:bg-primary/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Imagen</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-5 py-3 font-medium text-gray-500">SKU</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Precio</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Stock</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Estado</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-5 py-3">
                          <Skeleton variant="rect" className="h-10 w-10 rounded-input" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-40" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-24" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-20" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-16 ml-auto" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-10 ml-auto" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-14" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-14" />
                        </td>
                      </tr>
                    ))
                  : products.map((product) => {
                      const primaryImage = product.images?.[0];
                      const categoryNames = product.categories
                        ?.map((c) => c.name)
                        .join(', ');

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={product.name}
                                className="h-10 w-10 rounded-input object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-input bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                -
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-secondary max-w-[200px] truncate">
                            {product.name}
                          </td>
                          <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                            {product.sku}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {categoryNames || '-'}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-secondary">
                            {formatUYU(Number(product.basePrice))}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                product.totalStock === 0
                                  ? 'text-error'
                                  : product.totalStock <= 5
                                    ? 'text-amber-600'
                                    : 'text-secondary',
                              )}
                            >
                              {product.totalStock}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() =>
                                handleToggleActive(product.id, product.isActive)
                              }
                              className={cn(
                                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                                product.isActive ? 'bg-success' : 'bg-gray-300',
                              )}
                              role="switch"
                              aria-checked={product.isActive}
                              aria-label={
                                product.isActive ? 'Desactivar' : 'Activar'
                              }
                            >
                              <span
                                className={cn(
                                  'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
                                  product.isActive
                                    ? 'translate-x-[18px]'
                                    : 'translate-x-[3px]',
                                )}
                              />
                            </button>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="rounded-button p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                                aria-label={`Editar ${product.name}`}
                                onClick={() =>
                                  navigate(`/admin/productos/${product.id}`)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                className="rounded-button p-1.5 text-gray-400 hover:bg-red-50 hover:text-error transition-colors"
                                aria-label={`Eliminar ${product.name}`}
                                onClick={() => handleDeleteClick(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar producto"
        message="Esta accion no se puede deshacer. El producto sera eliminado permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
