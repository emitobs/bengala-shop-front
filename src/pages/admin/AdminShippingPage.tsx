import { useState } from 'react';
import { Edit2, Loader2, Plus, Trash2, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useShippingZones,
  useCreateShippingZone,
  useUpdateShippingZone,
  useDeleteShippingZone,
} from '@/hooks/useAdmin';
import type { ShippingZone } from '@/api/admin.api';

const DEPARTMENT_OPTIONS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
  'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
  'Paysandu', 'Rio Negro', 'Rivera', 'Rocha', 'Salto',
  'San Jose', 'Soriano', 'Tacuarembo', 'Treinta y Tres',
];

interface ZoneForm {
  name: string;
  departments: string[];
  baseCost: string;
  freeAbove: string;
  estimatedDays: string;
  isActive: boolean;
}

export default function AdminShippingPage() {
  const { data: zones, isLoading, isError } = useShippingZones();
  const createMutation = useCreateShippingZone();
  const updateMutation = useUpdateShippingZone();
  const deleteMutation = useDeleteShippingZone();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<ZoneForm>({
    name: '',
    departments: [],
    baseCost: '',
    freeAbove: '',
    estimatedDays: '',
    isActive: true,
  });

  const handleOpenModal = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone);
      setForm({
        name: zone.name,
        departments: zone.departments,
        baseCost: String(Number(zone.baseCost)),
        freeAbove: zone.freeAbove != null ? String(Number(zone.freeAbove)) : '',
        estimatedDays: String(zone.estimatedDays),
        isActive: zone.isActive,
      });
    } else {
      setEditingZone(null);
      setForm({
        name: '',
        departments: [],
        baseCost: '',
        freeAbove: '',
        estimatedDays: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleDepartment = (dept: string) => {
    setForm((f) => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter((d) => d !== dept)
        : [...f.departments, dept],
    }));
  };

  const handleSave = () => {
    if (editingZone) {
      updateMutation.mutate(
        {
          id: editingZone.id,
          data: {
            name: form.name,
            departments: form.departments,
            baseCost: Number(form.baseCost) || 0,
            freeAbove: form.freeAbove ? Number(form.freeAbove) : undefined,
            estimatedDays: Number(form.estimatedDays) || 1,
            isActive: form.isActive,
          },
        },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createMutation.mutate(
        {
          name: form.name,
          departments: form.departments,
          baseCost: Number(form.baseCost) || 0,
          freeAbove: form.freeAbove ? Number(form.freeAbove) : undefined,
          estimatedDays: Number(form.estimatedDays) || 1,
        },
        { onSuccess: () => setIsModalOpen(false) },
      );
    }
  };

  const handleToggleActive = (zone: ShippingZone) => {
    updateMutation.mutate({
      id: zone.id,
      data: { isActive: !zone.isActive },
    });
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

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar zonas de envio. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Zonas de Envio</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona las zonas y costos de envio
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nueva zona
        </Button>
      </div>

      {/* Zones table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Zona
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Departamentos
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">
                    Costo base
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">
                    Gratis desde
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">
                    Dias estimados
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
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-3">
                            <Skeleton variant="text" className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : zones?.map((zone) => (
                      <tr key={zone.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium text-secondary">
                              {zone.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {zone.departments.slice(0, 3).map((dept) => (
                              <Badge key={dept} variant="default">
                                {dept}
                              </Badge>
                            ))}
                            {zone.departments.length > 3 && (
                              <Badge variant="default">
                                +{zone.departments.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-secondary">
                          {formatUYU(Number(zone.baseCost))}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {zone.freeAbove != null
                            ? formatUYU(Number(zone.freeAbove))
                            : '-'}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-500">
                          {zone.estimatedDays} dias
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(zone)}
                            className={cn(
                              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                              zone.isActive ? 'bg-success' : 'bg-gray-300',
                            )}
                            role="switch"
                            aria-checked={zone.isActive}
                          >
                            <span
                              className={cn(
                                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
                                zone.isActive
                                  ? 'translate-x-[18px]'
                                  : 'translate-x-[3px]',
                              )}
                            />
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenModal(zone)}
                              className="rounded-full p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                              aria-label="Editar zona"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(zone.id)}
                              className="rounded-full p-1.5 text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
                              aria-label="Eliminar zona"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && zones?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      No hay zonas de envio. Crea la primera.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Editar zona de envio' : 'Nueva zona de envio'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la zona"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Montevideo Capital"
          />

          {/* Department selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Departamentos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border rounded-input p-3">
              {DEPARTMENT_OPTIONS.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.departments.includes(dept)}
                    onChange={() => handleToggleDepartment(dept)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-secondary">{dept}</span>
                </label>
              ))}
            </div>
            {form.departments.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {form.departments.length} seleccionados
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Costo base (UYU)"
              type="number"
              value={form.baseCost}
              onChange={(e) =>
                setForm((f) => ({ ...f, baseCost: e.target.value }))
              }
              placeholder="0"
            />
            <Input
              label="Gratis desde (UYU)"
              type="number"
              value={form.freeAbove}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeAbove: e.target.value }))
              }
              placeholder="Dejar vacio si no aplica"
            />
            <Input
              label="Dias estimados"
              type="number"
              value={form.estimatedDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, estimatedDays: e.target.value }))
              }
              placeholder="3"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="zone-active"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="zone-active" className="text-sm text-secondary">
              Zona activa
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isMutating}>
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Guardar
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar zona de envio"
        message="Esta accion no se puede deshacer. La zona de envio sera eliminada permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
