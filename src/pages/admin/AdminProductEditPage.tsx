import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  GripVertical,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Edit2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';
import { getProductBySlugApi } from '@/api/products.api';
import {
  useCreateProduct,
  useUpdateProduct,
  useAdminCategories,
} from '@/hooks/useAdmin';
import type { AdminProduct } from '@/api/admin.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';

type TabKey = 'info' | 'images' | 'variants';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Informacion' },
  { key: 'images', label: 'Imagenes' },
  { key: 'variants', label: 'Variantes' },
];

const VARIANT_TYPE_OPTIONS = [
  { value: 'SIZE', label: 'Talle' },
  { value: 'COLOR', label: 'Color' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'STYLE', label: 'Estilo' },
  { value: 'OTHER', label: 'Otro' },
];

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/1E1E2E/E85D2C?text=Bengala+Max';

interface ImageItem {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface LocalVariant {
  id: string;
  name: string;
  type: string;
  sku: string;
  priceAdjustment: number;
  stock: number;
  isActive: boolean;
}

interface VariantForm {
  name: string;
  type: string;
  sku: string;
  priceAdjustment: string;
  stock: string;
}

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'nuevo';

  // Fetch existing product (only for edit mode)
  const {
    data: existingProduct,
    isLoading: productLoading,
  } = useQuery({
    queryKey: ['admin', 'product-detail', id],
    queryFn: async (): Promise<AdminProduct> => {
      // Use the admin list endpoint with the ID to get product data
      // Since we don't have a getProductById admin endpoint, we fetch from the slug endpoint
      // But the id parameter from URL is an ID, not a slug. Use the products admin list or fetch by slug.
      // We'll use a direct apiClient call since the products controller has findBySlug.
      // Actually the controller exposes GET /products/:slug which uses slug, not id.
      // The admin products list includes full data. Let's use apiClient directly.
      const { apiClient } = await import('@/api/client');
      const response = await apiClient.get(`/products/admin/list`, {
        params: { limit: 1, search: '' },
      });
      // This approach won't work well. Let's fetch the full admin list and filter.
      // Actually, let's use the update endpoint to get the product after patching nothing.
      // Best approach: fetch the product by making a special request using admin list with search.
      // The cleanest way is to just call the products/:slug endpoint. But we have an ID.
      // Let's call the backend with a custom request to get the product by ID via include.
      const res = await apiClient.get(`/products/admin/list`, {
        params: { limit: 100 },
      });
      const found = (res.data as { data: AdminProduct[] }).data.find(
        (p: AdminProduct) => p.id === id,
      );
      if (!found) throw new Error('Product not found');
      return found;
    },
    enabled: !isNew,
  });

  // Fetch categories
  const { data: categories } = useAdminCategories();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [activeTab, setActiveTab] = useState<TabKey>('info');

  // Info form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);

  // Variants state
  const [variants, setVariants] = useState<LocalVariant[]>([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>({
    name: '',
    type: 'COLOR',
    sku: '',
    priceAdjustment: '0',
    stock: '0',
  });

  // Populate form when product loads
  useEffect(() => {
    if (existingProduct && !isNew) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setShortDescription(existingProduct.shortDescription ?? '');
      setSku(existingProduct.sku);
      setBasePrice(String(Number(existingProduct.basePrice)));
      setCompareAtPrice(
        existingProduct.compareAtPrice
          ? String(Number(existingProduct.compareAtPrice))
          : '',
      );
      setCostPrice(
        existingProduct.costPrice
          ? String(Number(existingProduct.costPrice))
          : '',
      );
      setIsFeatured(existingProduct.isFeatured);
      setIsActive(existingProduct.isActive);

      // Set category IDs from the categories array
      // The admin list returns categories as { name: string }[] without IDs
      // We need to match them with the categories list
      if (categories && existingProduct.categories) {
        const matchedIds = existingProduct.categories
          .map((c) => {
            const found = categories.find((cat) => cat.name === c.name);
            return found?.id;
          })
          .filter(Boolean) as string[];
        setCategoryIds(matchedIds);
      }

      // Set images
      if (existingProduct.images) {
        setImages(
          existingProduct.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
          })),
        );
      }
    }
  }, [existingProduct, isNew, categories]);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.parent ? `  ${cat.name}` : cat.name,
    }));
  }, [categories]);

  const handleSave = () => {
    const productData = {
      name,
      description,
      shortDescription: shortDescription || undefined,
      sku,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      isActive,
      isFeatured,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      variants: isNew && variants.length > 0
        ? variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            type: v.type,
            value: v.name,
            priceAdjustment: v.priceAdjustment,
            stock: v.stock,
          }))
        : undefined,
    };

    if (isNew) {
      createMutation.mutate(productData, {
        onSuccess: () => navigate('/admin/productos'),
      });
    } else if (id) {
      updateMutation.mutate(
        { id, data: productData },
        { onSuccess: () => navigate('/admin/productos') },
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleDeleteImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleAddImagePlaceholder = () => {
    const newImage: ImageItem = {
      id: `img-${Date.now()}`,
      url: PLACEHOLDER_IMAGE,
      altText: 'Nueva imagen',
      sortOrder: images.length,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const handleOpenVariantModal = (variant?: LocalVariant) => {
    if (variant) {
      setEditingVariantId(variant.id);
      setVariantForm({
        name: variant.name,
        type: variant.type,
        sku: variant.sku,
        priceAdjustment: String(variant.priceAdjustment),
        stock: String(variant.stock),
      });
    } else {
      setEditingVariantId(null);
      setVariantForm({ name: '', type: 'COLOR', sku: '', priceAdjustment: '0', stock: '0' });
    }
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = () => {
    const adjustment = Number(variantForm.priceAdjustment) || 0;

    if (editingVariantId) {
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editingVariantId
            ? {
                ...v,
                name: variantForm.name,
                type: variantForm.type,
                sku: variantForm.sku,
                priceAdjustment: adjustment,
                stock: Number(variantForm.stock) || 0,
              }
            : v,
        ),
      );
    } else {
      const newVariant: LocalVariant = {
        id: `v-${Date.now()}`,
        name: variantForm.name,
        type: variantForm.type,
        sku: variantForm.sku,
        priceAdjustment: adjustment,
        stock: Number(variantForm.stock) || 0,
        isActive: true,
      };
      setVariants((prev) => [...prev, newVariant]);
    }
    setIsVariantModalOpen(false);
  };

  const handleDeleteVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleToggleVariantActive = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, isActive: !v.isActive } : v,
      ),
    );
  };

  if (!isNew && productLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="rect" className="h-64 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/productos')}
            className="rounded-full p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-secondary">
            {isNew ? 'Nuevo Producto' : 'Editar Producto'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/admin/productos')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-secondary hover:border-gray-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-secondary">
                  Informacion basica
                </h2>
              </CardHeader>
              <CardBody className="space-y-5">
                <Input
                  label="Nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                />
                <Textarea
                  label="Descripcion"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripcion completa del producto..."
                />
                <Input
                  label="Descripcion corta"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Breve descripcion para listados"
                />
                <Input
                  label="SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PROD-001"
                />
              </CardBody>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-secondary">Precios</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Input
                    label="Precio base (UYU)"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Precio comparacion (UYU)"
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Precio de costo (UYU)"
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {basePrice && costPrice && (
                  <p className="mt-3 text-sm text-gray-400">
                    Margen: {formatUYU(Number(basePrice) - Number(costPrice))} (
                    {Math.round(
                      ((Number(basePrice) - Number(costPrice)) /
                        Number(basePrice)) *
                        100,
                    )}
                    %)
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-secondary">Estado</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Activo</span>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isActive ? 'bg-success' : 'bg-gray-300',
                    )}
                    role="switch"
                    aria-checked={isActive}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                        isActive ? 'translate-x-6' : 'translate-x-1',
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Destacado</span>
                  <button
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isFeatured ? 'bg-accent' : 'bg-gray-300',
                    )}
                    role="switch"
                    aria-checked={isFeatured}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                        isFeatured ? 'translate-x-6' : 'translate-x-1',
                      )}
                    />
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-secondary">Categoria</h2>
              </CardHeader>
              <CardBody>
                <Select
                  value={categoryIds[0] ?? ''}
                  onChange={(e) =>
                    setCategoryIds(e.target.value ? [e.target.value] : [])
                  }
                  options={[
                    { value: '', label: 'Selecciona una categoria' },
                    ...categoryOptions,
                  ]}
                  placeholder="Selecciona una categoria"
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Images */}
      {activeTab === 'images' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-secondary">
                Imagenes del producto
              </h2>
              <p className="text-xs text-gray-400">
                Arrastra para reordenar
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square rounded-lg border-2 border-border overflow-hidden bg-gray-50"
                >
                  <img
                    src={image.url}
                    alt={image.altText ?? ''}
                    className="h-full w-full object-cover"
                  />
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 rounded bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  </button>
                  {/* Sort order badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="default">{image.sortOrder + 1}</Badge>
                  </div>
                </div>
              ))}

              {/* Upload placeholder */}
              <button
                onClick={handleAddImagePlaceholder}
                className={cn(
                  'aspect-square rounded-lg border-2 border-dashed border-gray-300',
                  'flex flex-col items-center justify-center gap-2',
                  'text-gray-400 hover:text-primary hover:border-primary transition-colors',
                )}
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-medium">Agregar imagen</span>
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab: Variants */}
      {activeTab === 'variants' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-secondary">Variantes</h2>
              <Button size="sm" onClick={() => handleOpenVariantModal()}>
                <Plus className="h-4 w-4" />
                Agregar variante
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {variants.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p>No hay variantes. Agrega la primera.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="px-5 py-3 text-left font-medium text-gray-500">
                        Nombre
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500">
                        Tipo
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500">
                        SKU
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Ajuste precio
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Stock
                      </th>
                      <th className="px-5 py-3 text-center font-medium text-gray-500">
                        Activo
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {variants.map((variant) => {
                      const typeLabel =
                        VARIANT_TYPE_OPTIONS.find((t) => t.value === variant.type)
                          ?.label ?? variant.type;

                      return (
                        <tr key={variant.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-secondary">
                            {variant.name}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            <Badge variant="default">{typeLabel}</Badge>
                          </td>
                          <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                            {variant.sku}
                          </td>
                          <td className="px-5 py-3 text-right text-secondary">
                            {variant.priceAdjustment !== 0
                              ? formatUYU(variant.priceAdjustment)
                              : '-'}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                variant.stock <= 0
                                  ? 'text-error'
                                  : variant.stock <= 5
                                    ? 'text-amber-500'
                                    : 'text-secondary',
                              )}
                            >
                              {variant.stock}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => handleToggleVariantActive(variant.id)}
                              className={cn(
                                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                                variant.isActive ? 'bg-success' : 'bg-gray-300',
                              )}
                              role="switch"
                              aria-checked={variant.isActive}
                            >
                              <span
                                className={cn(
                                  'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
                                  variant.isActive
                                    ? 'translate-x-[18px]'
                                    : 'translate-x-[3px]',
                                )}
                              />
                            </button>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleOpenVariantModal(variant)}
                                className="rounded-full p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                                aria-label="Editar variante"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(variant.id)}
                                className="rounded-full p-1.5 text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
                                aria-label="Eliminar variante"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Variant Modal */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={editingVariantId ? 'Editar variante' : 'Nueva variante'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={variantForm.name}
            onChange={(e) =>
              setVariantForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Ej: Rojo, Talle M, etc."
          />
          <Select
            label="Tipo"
            value={variantForm.type}
            onChange={(e) =>
              setVariantForm((f) => ({ ...f, type: e.target.value }))
            }
            options={VARIANT_TYPE_OPTIONS}
          />
          <Input
            label="SKU"
            value={variantForm.sku}
            onChange={(e) =>
              setVariantForm((f) => ({ ...f, sku: e.target.value }))
            }
            placeholder="PROD-001-VAR"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ajuste de precio (UYU)"
              type="number"
              value={variantForm.priceAdjustment}
              onChange={(e) =>
                setVariantForm((f) => ({
                  ...f,
                  priceAdjustment: e.target.value,
                }))
              }
              placeholder="0"
            />
            <Input
              label="Stock"
              type="number"
              value={variantForm.stock}
              onChange={(e) =>
                setVariantForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="0"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsVariantModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveVariant}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
