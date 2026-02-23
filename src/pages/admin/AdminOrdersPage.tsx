import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Card, { CardBody } from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import { formatUYU } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { useAdminOrders } from '@/hooks/useAdmin';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'error' }
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

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'PROCESSING', label: 'En proceso' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reembolsado' },
];

const ORDERS_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useAdminOrders({
    page: currentPage,
    limit: ORDERS_PER_PAGE,
    status: statusFilter || undefined,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar pedidos. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-secondary">Pedidos</h1>

      {/* Filter bar */}
      <Card>
        <CardBody>
          <div className="max-w-xs">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filtrar por estado"
            />
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
                    Items
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">
                    Total
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-3">
                            <Skeleton variant="text" className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : orders.map((order) => {
                      const statusCfg = STATUS_CONFIG[order.status] ?? {
                        label: order.status,
                        variant: 'default' as const,
                      };
                      const customerName = `${order.user.firstName} ${order.user.lastName}`;

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-secondary">
                            {order.orderNumber}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {customerName}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-5 py-3 text-right text-gray-600">
                            {order.items.length}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-secondary">
                            {formatUYU(Number(order.total))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={statusCfg.variant}>
                              {statusCfg.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              to={`/admin/pedidos/${order.id}`}
                              className="inline-flex items-center gap-1 rounded-button p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                              aria-label={`Ver detalle del pedido ${order.orderNumber}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                {!isLoading && orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No se encontraron pedidos con los filtros aplicados.
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
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
