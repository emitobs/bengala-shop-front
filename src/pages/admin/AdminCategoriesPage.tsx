import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderTree,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useAdmin';
import type { AdminCategory } from '@/api/admin.api';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  productCount: number;
  isActive: boolean;
  children: CategoryNode[];
}

function buildTree(categories: AdminCategory[]): CategoryNode[] {
  const rootCategories = categories.filter((c) => !c.parentId);
  return rootCategories.map((root) => ({
    id: root.id,
    name: root.name,
    slug: root.slug,
    description: root.description,
    imageUrl: root.imageUrl,
    parentId: root.parentId,
    productCount: root._count.products,
    isActive: root.isActive,
    children: categories
      .filter((c) => c.parentId === root.id)
      .map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        imageUrl: child.imageUrl,
        parentId: child.parentId,
        productCount: child._count.products,
        isActive: child.isActive,
        children: categories
          .filter((c) => c.parentId === child.id)
          .map((grandchild) => ({
            id: grandchild.id,
            name: grandchild.name,
            slug: grandchild.slug,
            description: grandchild.description,
            imageUrl: grandchild.imageUrl,
            parentId: grandchild.parentId,
            productCount: grandchild._count.products,
            isActive: grandchild.isActive,
            children: [],
          })),
      })),
  }));
}

function flattenForSelect(
  categories: CategoryNode[],
  prefix = '',
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  for (const cat of categories) {
    result.push({ value: cat.id, label: prefix + cat.name });
    if (cat.children.length > 0) {
      result.push(...flattenForSelect(cat.children, prefix + '  '));
    }
  }
  return result;
}

export default function AdminCategoriesPage() {
  const { data: rawCategories, isLoading, isError } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categoryTree = useMemo(
    () => (rawCategories ? buildTree(rawCategories) : []),
    [rawCategories],
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentId: '',
    imageUrl: '',
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive: !currentActive },
    });
  };

  const handleOpenModal = (category?: CategoryNode) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        description: category.description ?? '',
        parentId: category.parentId ?? '',
        imageUrl: category.imageUrl ?? '',
      });
    } else {
      setEditingCategory(null);
      setForm({ name: '', description: '', parentId: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      updateMutation.mutate(
        {
          id: editingCategory.id,
          data: {
            name: form.name,
            description: form.description || undefined,
            imageUrl: form.imageUrl || undefined,
          },
        },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createMutation.mutate(
        {
          name: form.name,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          parentId: form.parentId || undefined,
        },
        { onSuccess: () => setIsModalOpen(false) },
      );
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

  const isMutating =
    createMutation.isPending || updateMutation.isPending;

  const parentOptions = [
    { value: '', label: 'Sin categoria padre (raiz)' },
    ...flattenForSelect(categoryTree),
  ];

  const renderCategoryRow = (category: CategoryNode, depth: number) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-3 px-5 py-3 border-b border-border hover:bg-gray-50/50 transition-colors"
          style={{ paddingLeft: `${20 + depth * 28}px` }}
        >
          {/* Expand toggle */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={cn(
              'flex items-center justify-center h-6 w-6 rounded shrink-0',
              hasChildren
                ? 'text-gray-400 hover:text-secondary hover:bg-gray-100'
                : 'invisible',
            )}
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Icon */}
          <FolderTree
            className={cn(
              'h-4 w-4 shrink-0',
              depth === 0 ? 'text-primary' : 'text-gray-400',
            )}
          />

          {/* Name + Slug */}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-secondary">{category.name}</span>
            <span className="text-xs text-gray-400 ml-2">/{category.slug}</span>
          </div>

          {/* Product count */}
          <span className="text-sm text-gray-400 shrink-0">
            {category.productCount} productos
          </span>

          {/* Active toggle */}
          <button
            onClick={() => handleToggleActive(category.id, category.isActive)}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
              category.isActive ? 'bg-success' : 'bg-gray-300',
            )}
            role="switch"
            aria-checked={category.isActive}
            aria-label={category.isActive ? 'Desactivar' : 'Activar'}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm',
                category.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]',
              )}
            />
          </button>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => handleOpenModal(category)}
              className="rounded-full p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
              aria-label="Editar"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleDeleteClick(category.id)}
              className="rounded-full p-1.5 text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children.map((child) => renderCategoryRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalCategories = rawCategories?.length ?? 0;
  const rootCategories = categoryTree.length;

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar categorias. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Categorias</h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalCategories} categorias en total
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nueva categoria
        </Button>
      </div>

      {/* Category tree */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-secondary">
              Arbol de categorias
            </h2>
            <div className="flex gap-2">
              <Badge variant="default">{rootCategories} raiz</Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="h-10 w-full" />
              ))}
            </div>
          ) : (
            categoryTree.map((cat) => renderCategoryRow(cat, 0))
          )}
          {!isLoading && categoryTree.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No hay categorias. Crea la primera.
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar categoria' : 'Nueva categoria'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre de la categoria"
          />
          <Textarea
            label="Descripcion"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Descripcion opcional..."
            className="min-h-[80px]"
          />
          {!editingCategory && (
            <Select
              label="Categoria padre"
              value={form.parentId}
              onChange={(e) =>
                setForm((f) => ({ ...f, parentId: e.target.value }))
              }
              options={parentOptions}
            />
          )}
          <Input
            label="URL de imagen"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
            placeholder="https://..."
          />
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
        title="Eliminar categoria"
        message="Esta accion no se puede deshacer. Si la categoria tiene subcategorias, estas seran reasignadas."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
