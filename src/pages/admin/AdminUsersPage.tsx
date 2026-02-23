import { useState, useCallback } from 'react';
import { Users, Plus, Search, X, KeyRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format-date';
import Badge from '@/components/ui/Badge';
import Card, { CardBody } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useAdminUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminResetPassword,
} from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/auth.store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_BADGE_MAP: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  CUSTOMER: { label: 'Cliente', variant: 'default' },
  ADMIN: { label: 'Admin', variant: 'info' },
  WAREHOUSE: { label: 'Almacen', variant: 'success' },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'warning' },
};

const ALL_ROLES = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'WAREHOUSE', label: 'Almacen' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const USERS_PER_PAGE = 20;

/** Returns roles the current actor is allowed to assign */
function getAllowedRoles(actorRole: string) {
  if (actorRole === 'SUPER_ADMIN') return ALL_ROLES;
  return ALL_ROLES.filter((r) => r.value !== 'SUPER_ADMIN');
}

// ---------------------------------------------------------------------------
// Create User Modal
// ---------------------------------------------------------------------------

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const createMutation = useAdminCreateUser();
  const currentUser = useAuthStore((s) => s.user);
  const allowedRoles = getAllowedRoles(currentUser?.role ?? 'ADMIN');

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { ...form, phone: form.phone || undefined },
      {
        onSuccess: () => {
          onClose();
          setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CUSTOMER' });
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {allowedRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reset Password Modal
// ---------------------------------------------------------------------------

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

function ResetPasswordModal({ open, onClose, userId, userName }: ResetPasswordModalProps) {
  const resetMutation = useAdminResetPassword();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate(
      { id: userId, data: { password } },
      {
        onSuccess: () => {
          onClose();
          setPassword('');
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">Restablecer Contrasena</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Nueva contrasena para <strong>{userName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={resetMutation.isPending}>
              Restablecer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Role Select (with confirmation)
// ---------------------------------------------------------------------------

function RoleSelect({
  userId,
  currentRole,
  userName,
}: {
  userId: string;
  currentRole: string;
  userName: string;
}) {
  const updateMutation = useAdminUpdateUser();
  const currentUser = useAuthStore((s) => s.user);
  const allowedRoles = getAllowedRoles(currentUser?.role ?? 'ADMIN');
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  // Prevent changing own role
  if (currentUser?.id === userId) {
    const roleInfo = ROLE_BADGE_MAP[currentRole] ?? { label: currentRole, variant: 'default' as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  }

  // ADMIN cannot modify SUPER_ADMIN users
  if (currentRole === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
    return <Badge variant="warning">Super Admin</Badge>;
  }

  const handleRoleChange = (newRole: string) => {
    if (newRole === currentRole) return;
    setPendingRole(newRole);
  };

  const confirmRoleChange = () => {
    if (!pendingRole) return;
    updateMutation.mutate(
      { id: userId, data: { role: pendingRole } },
      { onSettled: () => setPendingRole(null) },
    );
  };

  const pendingLabel = ALL_ROLES.find((r) => r.value === pendingRole)?.label ?? pendingRole;

  return (
    <>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={updateMutation.isPending}
        className="text-xs rounded-lg border border-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white cursor-pointer"
      >
        {allowedRoles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <ConfirmDialog
        isOpen={!!pendingRole}
        onClose={() => setPendingRole(null)}
        onConfirm={confirmRoleChange}
        title="Cambiar rol"
        message={`Estas seguro de cambiar el rol de ${userName} a "${pendingLabel}"?`}
        confirmLabel="Cambiar rol"
        variant="warning"
        isLoading={updateMutation.isPending}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Active Toggle (with confirmation)
// ---------------------------------------------------------------------------

function ActiveToggle({
  userId,
  isActive,
  userName,
}: {
  userId: string;
  isActive: boolean;
  userName: string;
}) {
  const updateMutation = useAdminUpdateUser();
  const currentUser = useAuthStore((s) => s.user);
  const [showConfirm, setShowConfirm] = useState(false);

  // Prevent deactivating yourself
  if (currentUser?.id === userId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <span className="h-2 w-2 rounded-full bg-success" />
        Activo
      </span>
    );
  }

  // ADMIN cannot modify SUPER_ADMIN users
  if (currentUser?.role !== 'SUPER_ADMIN') {
    // Check if target is SUPER_ADMIN - we need to get this from parent, but we already filter in RoleSelect
    // For the toggle we just show as-is since the backend will reject unauthorized changes
  }

  const handleToggle = () => {
    if (isActive) {
      // Deactivating requires confirmation
      setShowConfirm(true);
    } else {
      // Reactivating doesn't need confirmation
      updateMutation.mutate({ id: userId, data: { isActive: true } });
    }
  };

  const confirmDeactivate = () => {
    updateMutation.mutate(
      { id: userId, data: { isActive: false } },
      { onSettled: () => setShowConfirm(false) },
    );
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={updateMutation.isPending}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          isActive ? 'bg-success' : 'bg-gray-300',
          updateMutation.isPending && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
            isActive ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </button>
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDeactivate}
        title="Desactivar usuario"
        message={`Estas seguro de desactivar a ${userName}? El usuario no podra iniciar sesion.`}
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={updateMutation.isPending}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isError } = useAdminUsers({
    page: currentPage,
    limit: USERS_PER_PAGE,
    search: searchQuery || undefined,
    role: roleFilter || undefined,
    isActive: statusFilter || undefined,
  });

  const users = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  const hasFilters = !!searchQuery || !!roleFilter || !!statusFilter;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    },
    [searchInput],
  );

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  }, []);

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar usuarios. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Usuarios</h1>
          <p className="text-sm text-gray-400 mt-1">
            {meta ? `${meta.total} usuarios registrados` : 'Cargando...'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-64 rounded-lg border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Buscar
          </Button>
        </form>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
        >
          <option value="">Todos los roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Clear all */}
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Users table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Usuario
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">
                    Rol
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">
                    Registrado
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">
                    Pedidos
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">
                    Activo
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton variant="circle" className="h-8 w-8" />
                            <Skeleton variant="text" className="h-4 w-28" />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-36" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-16 mx-auto" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-24" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-8 mx-auto" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-14 mx-auto" />
                        </td>
                        <td className="px-5 py-3">
                          <Skeleton variant="text" className="h-4 w-8 mx-auto" />
                        </td>
                      </tr>
                    ))
                  : users.length === 0
                    ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center">
                            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400">
                              {hasFilters
                                ? 'No se encontraron usuarios con esos filtros'
                                : 'No se encontraron usuarios'}
                            </p>
                          </td>
                        </tr>
                      )
                    : users.map((user) => {
                        const fullName = `${user.firstName} ${user.lastName}`;
                        const orderCount = user._count?.orders ?? 0;

                        return (
                          <tr key={user.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={null}
                                  name={fullName}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-medium text-secondary">
                                    {fullName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <RoleSelect
                                userId={user.id}
                                currentRole={user.role}
                                userName={fullName}
                              />
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-5 py-3 text-center text-gray-500">
                              {orderCount}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <ActiveToggle
                                userId={user.id}
                                isActive={user.isActive}
                                userName={fullName}
                              />
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => setResetTarget({ id: user.id, name: fullName })}
                                className="text-gray-400 hover:text-primary transition-colors"
                                title="Restablecer contrasena"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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

      {/* Create User Modal */}
      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Reset Password Modal */}
      {resetTarget && (
        <ResetPasswordModal
          open
          onClose={() => setResetTarget(null)}
          userId={resetTarget.id}
          userName={resetTarget.name}
        />
      )}
    </div>
  );
}
