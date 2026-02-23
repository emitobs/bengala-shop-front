import { useState } from 'react';
import {
  Store,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  useRegenerateBranchKey,
  useSyncLogs,
} from '@/hooks/useAdmin';
import type { Branch, SyncLog } from '@/api/admin.api';

function formatDate(date: string | null) {
  if (!date) return 'Nunca';
  return new Date(date).toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ApiKeyCell({ apiKey }: { apiKey: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <code className="flex-1 text-xs font-mono text-gray-500">
        {visible ? apiKey : '••••••••••••••••'}
      </code>
      <button
        onClick={() => setVisible(!visible)}
        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-secondary"
        title={visible ? 'Ocultar' : 'Mostrar'}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function AdminBranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const { data: logs, isLoading: logsLoading } = useSyncLogs();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();
  const regenerateMutation = useRegenerateBranchKey();

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const handleCreate = () => {
    if (!formName || !formCode || !formLocation) return;
    createMutation.mutate(
      { name: formName, code: formCode, location: formLocation },
      {
        onSuccess: () => {
          setShowForm(false);
          setFormName('');
          setFormCode('');
          setFormLocation('');
        },
      },
    );
  };

  const handleRegenerate = (branch: Branch) => {
    if (!confirm(`¿Regenerar la API Key de "${branch.name}"? El sync agent dejara de funcionar hasta que se actualice la nueva key.`)) return;
    regenerateMutation.mutate(branch.id);
  };

  const handleToggleActive = (branch: Branch) => {
    if (branch.isActive) {
      deleteMutation.mutate(branch.id);
    } else {
      updateMutation.mutate({ id: branch.id, data: { isActive: true } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Sucursales</h1>
          <p className="mt-1 text-sm text-gray-400">
            Gestion de sucursales y sincronizacion con el POS
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva sucursal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-secondary">Nombre</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Bengala Max FB1"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary">Codigo</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="FB1"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary">Ubicacion</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Fray Bentos"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formName || !formCode || !formLocation}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createMutation.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Branches list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-secondary">Sucursales registradas</h2>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton variant="text" className="h-12 w-full" />
              <Skeleton variant="text" className="h-12 w-full" />
              <Skeleton variant="text" className="h-12 w-full" />
            </div>
          ) : !branches?.length ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No hay sucursales registradas. Crea una para comenzar la sincronizacion.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {branches.map((branch) => (
                <div key={branch.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-secondary">{branch.name}</h3>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-500">
                          {branch.code}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            branch.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {branch.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-400">{branch.location}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        Ultimo sync: {formatDate(branch.lastSyncAt)}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">API Key:</p>
                        <ApiKeyCell apiKey={branch.apiKey} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRegenerate(branch)}
                        disabled={regenerateMutation.isPending}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-secondary"
                        title="Regenerar API Key"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerar Key
                      </button>
                      <button
                        onClick={() => handleToggleActive(branch)}
                        className={cn(
                          'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                          branch.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50',
                        )}
                      >
                        {branch.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-secondary">Ultimos logs de sincronizacion</h2>
          </div>
        </CardHeader>
        <CardBody>
          {logsLoading ? (
            <div className="space-y-2">
              <Skeleton variant="text" className="h-8 w-full" />
              <Skeleton variant="text" className="h-8 w-full" />
              <Skeleton variant="text" className="h-8 w-full" />
            </div>
          ) : !logs?.length ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No hay logs de sincronizacion todavia.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase text-gray-400">
                    <th className="pb-2 pr-4">Fecha</th>
                    <th className="pb-2 pr-4">Sucursal</th>
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4">Estado</th>
                    <th className="pb-2 pr-4 text-right">Items</th>
                    <th className="pb-2 text-right">Duracion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.slice(0, 20).map((log: SyncLog) => (
                    <tr key={log.id}>
                      <td className="py-2 pr-4 text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                          {log.branch.code}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            log.type === 'stock'
                              ? 'bg-blue-50 text-blue-700'
                              : log.type === 'products'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-orange-50 text-orange-700',
                          )}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {log.status === 'success' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600" title={log.error || ''}>
                            <XCircle className="h-3.5 w-3.5" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-gray-500">
                        {log.itemCount}
                      </td>
                      <td className="py-2 text-right font-mono text-gray-500">
                        {formatDuration(log.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
