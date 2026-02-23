import { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  useAdminCoupons,
  useCreateCoupon,
  useToggleCoupon,
  useDeleteCoupon,
} from '@/hooks/useAdmin';
import { formatUYU } from '@/lib/format-currency';
import { cn } from '@/lib/cn';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import type { AdminCoupon } from '@/api/admin.api';

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const { data: couponsData, isLoading } = useAdminCoupons({ page, limit: 20 });
  const createCoupon = useCreateCoupon();
  const toggleCoupon = useToggleCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
  });

  const coupons = couponsData?.data ?? [];
  const meta = couponsData?.meta;

  const handleCreate = () => {
    if (!formData.code || !formData.discountValue) return;

    createCoupon.mutate(
      {
        code: formData.code,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt || undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minPurchase: '',
            maxDiscount: '',
            usageLimit: '',
            expiresAt: '',
          });
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (coupon: AdminCoupon) => {
    if (!confirm(`Eliminar el cupon "${coupon.code}"?`)) return;
    deleteCoupon.mutate(coupon.id);
  };

  const formatDiscount = (coupon: AdminCoupon) => {
    const value = Number(coupon.discountValue);
    return coupon.discountType === 'PERCENTAGE' ? `${value}%` : formatUYU(value);
  };

  const isExpired = (coupon: AdminCoupon) => {
    return coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Cupones</h1>
          <p className="mt-1 text-sm text-secondary-light">
            Gestiona los cupones de descuento de tu tienda
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
          Nuevo cupon
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-secondary">Crear cupon</h2>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Codigo"
                placeholder="Ej: VERANO2026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
              />
              <Input
                label="Descripcion (opcional)"
                placeholder="Ej: Descuento de verano"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Select
                label="Tipo de descuento"
                options={[
                  { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
                  { value: 'FIXED', label: 'Monto fijo ($)' },
                ]}
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                  })
                }
              />
              <Input
                label={formData.discountType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'}
                type="number"
                placeholder={formData.discountType === 'PERCENTAGE' ? 'Ej: 15' : 'Ej: 500'}
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
              />
              <Input
                label="Compra minima (opcional)"
                type="number"
                placeholder="Ej: 2000"
                value={formData.minPurchase}
                onChange={(e) =>
                  setFormData({ ...formData, minPurchase: e.target.value })
                }
              />
              {formData.discountType === 'PERCENTAGE' && (
                <Input
                  label="Descuento maximo (opcional)"
                  type="number"
                  placeholder="Ej: 1000"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: e.target.value })
                  }
                />
              )}
              <Input
                label="Limite de usos (opcional)"
                type="number"
                placeholder="Ej: 100"
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: e.target.value })
                }
              />
              <Input
                label="Expira (opcional)"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
                isLoading={createCoupon.isPending}
                disabled={!formData.code || !formData.discountValue}
              >
                Crear cupon
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Coupons list */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="h-12 w-full" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-secondary font-medium">No hay cupones</p>
              <p className="text-sm text-secondary-light mt-1">
                Crea tu primer cupon de descuento
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="px-4 py-3 text-left font-semibold text-secondary-light">
                      Codigo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-secondary-light">
                      Descuento
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-secondary-light hidden md:table-cell">
                      Compra min.
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-secondary-light hidden sm:table-cell">
                      Usos
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-secondary-light">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-secondary-light">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <div>
                            <p className="font-mono font-semibold text-secondary">
                              {coupon.code}
                            </p>
                            {coupon.description && (
                              <p className="text-xs text-secondary-light">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-secondary">
                        {formatDiscount(coupon)}
                      </td>
                      <td className="px-4 py-3 text-secondary-light hidden md:table-cell">
                        {coupon.minPurchase
                          ? formatUYU(Number(coupon.minPurchase))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-secondary">
                          {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isExpired(coupon) ? (
                          <Badge variant="warning">Expirado</Badge>
                        ) : coupon.isActive ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="default">Inactivo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleCoupon.mutate(coupon.id)}
                            className={cn(
                              'rounded-md p-1.5 transition-colors',
                              coupon.isActive
                                ? 'text-success hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100',
                            )}
                            title={coupon.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-error"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
