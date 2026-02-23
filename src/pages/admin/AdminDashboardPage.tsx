import {
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { formatUYU } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/cn';
import { useAdminDashboard } from '@/hooks/useAdmin';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'error' }
> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PAYMENT_PENDING: { label: 'Pago pendiente', variant: 'warning' },
  PAID: { label: 'Pagado', variant: 'success' },
  PROCESSING: { label: 'En proceso', variant: 'info' },
  SHIPPED: { label: 'Enviado', variant: 'info' },
  DELIVERED: { label: 'Entregado', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  REFUNDED: { label: 'Reembolsado', variant: 'default' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, isError } = useAdminDashboard();

  const today = new Date().toLocaleDateString('es-UY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar el dashboard. Intenta de nuevo.</p>
      </div>
    );
  }

  const stats = dashboard?.stats;

  const kpiItems = [
    {
      label: 'Ventas del mes',
      value: stats ? formatUYU(stats.monthRevenue) : '-',
      subValue: stats ? `Hoy: ${formatUYU(stats.todayRevenue)}` : '',
      icon: <DollarSign className="h-5 w-5 text-white" />,
      iconBg: 'bg-primary',
    },
    {
      label: 'Pedidos totales',
      value: stats ? String(stats.totalOrders) : '-',
      subValue: stats?.todayOrders ? `${stats.todayOrders} hoy` : '',
      icon: <ShoppingCart className="h-5 w-5 text-white" />,
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Productos activos',
      value: stats ? `${stats.activeProducts} / ${stats.totalProducts}` : '-',
      subValue: '',
      icon: <Package className="h-5 w-5 text-white" />,
      iconBg: 'bg-accent',
    },
    {
      label: 'Clientes',
      value: stats ? String(stats.totalUsers) : '-',
      subValue: '',
      icon: <Users className="h-5 w-5 text-white" />,
      iconBg: 'bg-success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">
          Bienvenido, Admin
        </h1>
        <p className="mt-1 text-sm text-gray-500 capitalize">{today}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardBody className="flex items-center gap-4">
                  <Skeleton variant="rect" className="h-12 w-12 rounded-card" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-3 w-24" />
                    <Skeleton variant="text" className="h-6 w-20" />
                  </div>
                </CardBody>
              </Card>
            ))
          : kpiItems.map((kpi) => (
              <Card key={kpi.label}>
                <CardBody className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-card',
                      kpi.iconBg,
                    )}
                  >
                    {kpi.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 truncate">{kpi.label}</p>
                    <p className="text-xl font-bold text-secondary">{kpi.value}</p>
                    {kpi.subValue && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-success">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.subValue}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary">
                Pedidos recientes
              </h2>
              <a
                href="/admin/pedidos"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver todos
              </a>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 py-3 font-medium text-gray-500">
                        Nro Pedido
                      </th>
                      <th className="px-5 py-3 font-medium text-gray-500">
                        Cliente
                      </th>
                      <th className="px-5 py-3 font-medium text-gray-500">
                        Fecha
                      </th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-right">
                        Total
                      </th>
                      <th className="px-5 py-3 font-medium text-gray-500">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.recentOrders.map((order) => {
                      const statusCfg = STATUS_CONFIG[order.status] ?? {
                        label: order.status,
                        variant: 'default' as const,
                      };
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-secondary">
                            {order.orderNumber}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {order.user.firstName} {order.user.lastName}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-secondary">
                            {formatUYU(Number(order.total))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={statusCfg.variant}>
                              {statusCfg.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {dashboard?.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                          No hay pedidos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Low stock variants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary">
                Productos con stock bajo
              </h2>
              <a
                href="/admin/productos?stockFilter=low_stock"
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver todos
              </a>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {dashboard?.lowStockVariants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-secondary truncate">
                        {variant.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Variante: {variant.name} ({variant.sku})
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-amber-600">
                      {variant.stock} uds.
                    </span>
                  </li>
                ))}
                {dashboard?.lowStockVariants.length === 0 && (
                  <li className="px-5 py-10 text-center text-gray-400">
                    No hay productos con stock bajo
                  </li>
                )}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-secondary">
            Pedidos por estado
          </h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="h-16 flex-1 rounded-card" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {dashboard?.ordersByStatus.map((item) => {
                const statusCfg = STATUS_CONFIG[item.status] ?? {
                  label: item.status,
                  variant: 'default' as const,
                };
                return (
                  <div
                    key={item.status}
                    className="flex items-center gap-3 rounded-card border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </div>
                    <span className="text-lg font-bold text-secondary">
                      {item.count}
                    </span>
                  </div>
                );
              })}
              {dashboard?.ordersByStatus.length === 0 && (
                <p className="text-gray-400">No hay datos</p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
