import { useState } from 'react';
import { Calendar, Edit2, Image, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format-date';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from '@/hooks/useAdmin';
import type { Banner } from '@/types';

const PLACEHOLDER_BANNER = 'https://placehold.co/1200x400/E85D2C/FFFFFF?text=Banner+Bengala+Max';

interface BannerForm {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const { data: banners, isLoading, isError } = useAdminBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    position: 'hero',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        title: banner.title,
        subtitle: banner.subtitle ?? '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl ?? '',
        position: banner.position,
        startDate: banner.startsAt ? banner.startsAt.split('T')[0] : '',
        endDate: banner.endsAt ? banner.endsAt.split('T')[0] : '',
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setForm({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '',
        position: 'hero',
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const bannerData = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      imageUrl: form.imageUrl || PLACEHOLDER_BANNER,
      linkUrl: form.linkUrl || undefined,
      position: form.position,
      isActive: form.isActive,
      startsAt: form.startDate ? `${form.startDate}T00:00:00Z` : undefined,
      endsAt: form.endDate ? `${form.endDate}T00:00:00Z` : undefined,
    };

    if (editingBanner) {
      updateMutation.mutate(
        { id: editingBanner.id, data: bannerData },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createMutation.mutate(bannerData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
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

  const handleToggleActive = (banner: Banner) => {
    updateMutation.mutate({
      id: banner.id,
      data: { isActive: !banner.isActive },
    });
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'hero':
        return 'Hero principal';
      case 'promo':
        return 'Promo';
      case 'secondary':
        return 'Banners secundarios';
      case 'HOME_HERO':
        return 'Hero principal';
      case 'HOME_SECONDARY':
        return 'Secundario';
      default:
        return position;
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar banners. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Banners</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona los banners promocionales del sitio
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nuevo banner
        </Button>
      </div>

      {/* Banner grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton variant="rect" className="aspect-[3/1] w-full" />
              <CardBody>
                <Skeleton variant="text" className="h-5 w-40 mb-2" />
                <Skeleton variant="text" className="h-4 w-32" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {banners?.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              {/* Banner image */}
              <div className="relative aspect-[3/1] bg-gray-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className={cn(
                    'h-full w-full object-cover',
                    !banner.isActive && 'opacity-50 grayscale',
                  )}
                />
                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <Badge
                    variant={banner.isActive ? 'success' : 'default'}
                    className="shadow-sm"
                  >
                    {banner.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                {/* Position badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="info" className="shadow-sm">
                    {getPositionLabel(banner.position)}
                  </Badge>
                </div>
              </div>

              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-secondary truncate">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                        {banner.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {banner.startsAt ? formatDate(banner.startsAt) : 'Sin fecha inicio'}
                        {banner.endsAt && ` - ${formatDate(banner.endsAt)}`}
                      </span>
                    </div>
                    {banner.linkUrl && (
                      <p className="text-xs text-primary mt-1 truncate">
                        {banner.linkUrl}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        banner.isActive ? 'bg-success' : 'bg-gray-300',
                      )}
                      role="switch"
                      aria-checked={banner.isActive}
                      aria-label={banner.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
                          banner.isActive
                            ? 'translate-x-[18px]'
                            : 'translate-x-[3px]',
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleOpenModal(banner)}
                      className="rounded-full p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                      aria-label="Editar banner"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(banner.id)}
                      className="rounded-full p-1.5 text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
                      aria-label="Eliminar banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {banners?.length === 0 && (
            <div className="col-span-2 py-12 text-center text-gray-400">
              No hay banners. Crea el primero.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Editar banner' : 'Nuevo banner'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Titulo"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titulo del banner"
          />
          <Textarea
            label="Subtitulo"
            value={form.subtitle}
            onChange={(e) =>
              setForm((f) => ({ ...f, subtitle: e.target.value }))
            }
            placeholder="Texto secundario (opcional)"
            className="min-h-[60px]"
          />
          <Input
            label="URL de imagen"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
            placeholder="https://..."
            icon={<Image className="h-4 w-4" />}
          />
          <Input
            label="Enlace (URL)"
            value={form.linkUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, linkUrl: e.target.value }))
            }
            placeholder="/productos?oferta=verano"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary">
              Posicion
            </label>
            <select
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-secondary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="hero">Hero principal (carrusel)</option>
              <option value="secondary">Banners secundarios (grilla)</option>
              <option value="promo">Promo (full-width)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha inicio"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
            <Input
              label="Fecha fin (opcional)"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="banner-active" className="text-sm text-secondary">
              Banner activo
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
        title="Eliminar banner"
        message="Esta accion no se puede deshacer. El banner sera eliminado permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
