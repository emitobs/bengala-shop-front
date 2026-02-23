import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/types/order.types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';

type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'PROCESSING', label: 'En proceso' },
  { key: 'DELIVERED', label: 'Entregados' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

const STATUS_BADGE_MAP: Record<
  Order['status'],
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PAYMENT_PENDING: { label: 'Pago pendiente', variant: 'warning' },
  PAID: { label: 'Pagado', variant: 'info' },
  PROCESSING: { label: 'En proceso', variant: 'info' },
  SHIPPED: { label: 'Enviado', variant: 'info' },
  DELIVERED: { label: 'Entregado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  REFUNDED: { label: 'Reembolsado', variant: 'default' },
};

const PLACEHOLDER_IMAGE = 'https://placehold.co/80x80/1E1E2E/E85D2C?text=BM';

const ORDERS_PER_PAGE = 10;

function matchesFilter(order: Order, filter: StatusFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'PENDING') return order.status === 'PENDING' || order.status === 'PAYMENT_PENDING';
  if (filter === 'PROCESSING') return order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED';
  if (filter === 'DELIVERED') return order.status === 'DELIVERED';
  if (filter === 'CANCELLED') return order.status === 'CANCELLED' || order.status === 'REFUNDED';
  return true;
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="h-10 w-10" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-5 w-32" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto">
                <Skeleton variant="rect" className="h-6 w-20" />
                <Skeleton variant="text" className="h-4 w-16" />
                <Skeleton variant="text" className="h-5 w-24" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrders({ page, limit: ORDERS_PER_PAGE });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const filteredOrders = orders.filter((o) => matchesFilter(o, activeFilter));

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Mi Cuenta', href: '/mi-cuenta' },
          { label: 'Mis Pedidos' },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl font-bold text-secondary mb-6">Mis Pedidos</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeFilter === filter.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && <OrdersSkeleton />}

      {/* Error state */}
      {isError && (
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" />
            <p className="text-gray-500">
              No se pudieron cargar tus pedidos. Intenta de nuevo mas tarde.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Empty / Orders list */}
      {!isLoading && !isError && (
        <>
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Todavia no tenes pedidos"
              description={
                activeFilter === 'ALL'
                  ? 'Cuando hagas tu primera compra, vas a poder ver tus pedidos aca.'
                  : 'No tenes pedidos con este filtro.'
              }
              actionLabel={activeFilter === 'ALL' ? 'Ir a comprar' : undefined}
              onAction={activeFilter === 'ALL' ? () => navigate('/productos') : undefined}
            />
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const statusInfo = STATUS_BADGE_MAP[order.status];

                return (
                  <Card key={order.id}>
                    <CardBody className="p-0">
                      {/* Order header - clickable to expand */}
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-5 text-left"
                      >
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-secondary">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:ml-auto">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {order.items.length}{' '}
                            {order.items.length === 1 ? 'articulo' : 'articulos'}
                          </span>
                          <span className="font-bold text-secondary">
                            {formatUYU(order.total)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Expanded items */}
                      {isExpanded && (
                        <div className="border-t border-border px-5 py-4">
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3"
                              >
                                <img
                                  src={item.imageUrl ?? PLACEHOLDER_IMAGE}
                                  alt={item.name}
                                  className="h-14 w-14 rounded-lg object-cover bg-gray-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-secondary truncate">
                                    {item.name}
                                  </p>
                                  {item.variantName && (
                                    <p className="text-xs text-gray-400">
                                      {item.variantName}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    Cant: {item.quantity} x {formatUYU(item.price)}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-secondary shrink-0">
                                  {formatUYU(item.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <Link to={`/mi-cuenta/pedidos/${order.id}`}>
                              <Button variant="outline" size="sm">
                                Ver detalle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}
