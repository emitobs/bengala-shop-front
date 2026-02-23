import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { useOrderDetail, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/auth.store';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Skeleton from '@/components/ui/Skeleton';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

const STATUS_BADGE_MAP: Record<
  string,
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

const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  APPROVED: { label: 'Aprobado', variant: 'success' },
  REJECTED: { label: 'Rechazado', variant: 'error' },
  REFUNDED: { label: 'Reembolsado', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  IN_PROCESS: { label: 'En proceso', variant: 'info' },
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAYMENT_PENDING', label: 'Pago pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'PROCESSING', label: 'En proceso' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reembolsado' },
];

const PLACEHOLDER_IMAGE = 'https://placehold.co/80x80/1E1E2E/E85D2C?text=BM';

// ---------------------------------------------------------------------------
// Timeline builder
// ---------------------------------------------------------------------------

interface TimelineEvent {
  label: string;
  date: string;
  note: string | null;
  icon: typeof Check;
  isCompleted: boolean;
  isCurrent: boolean;
}

function buildTimeline(
  status: string,
  createdAt: string,
  updatedAt: string,
  notes: string | null,
  statusHistory?: { fromStatus: string | null; toStatus: string; note: string | null; createdAt: string }[],
): TimelineEvent[] {
  const statusOrder: { status: string; label: string; icon: typeof Check }[] = [
    { status: 'PENDING', label: 'Pedido creado', icon: Package },
    { status: 'PAID', label: 'Pago confirmado', icon: CreditCard },
    { status: 'PROCESSING', label: 'En preparacion', icon: Clock },
    { status: 'SHIPPED', label: 'Enviado', icon: Truck },
    { status: 'DELIVERED', label: 'Entregado', icon: Check },
  ];

  if (status === 'CANCELLED' || status === 'REFUNDED') {
    return [
      {
        label: 'Pedido creado',
        date: createdAt,
        note: null,
        icon: Package,
        isCompleted: true,
        isCurrent: false,
      },
      {
        label: status === 'CANCELLED' ? 'Cancelado' : 'Reembolsado',
        date: updatedAt,
        note: notes,
        icon: XCircle,
        isCompleted: false,
        isCurrent: true,
      },
    ];
  }

  const currentIndex = statusOrder.findIndex((s) => s.status === status);

  return statusOrder.map((step, index) => {
    // Try to find date from status history
    const historyEntry = statusHistory?.find((h) => h.toStatus === step.status);
    let date = '';
    if (index === 0) {
      date = createdAt;
    } else if (historyEntry) {
      date = historyEntry.createdAt;
    } else if (index <= currentIndex) {
      date = updatedAt;
    }

    return {
      label: step.label,
      date,
      note: historyEntry?.note ?? null,
      icon: step.icon,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderDetail(id);
  const updateStatusMutation = useUpdateOrderStatus();
  const userRole = useAuthStore((s) => s.user?.role);

  const [newStatus, setNewStatus] = useState<string>('');
  const [internalNote, setInternalNote] = useState('');

  // Set default newStatus when order loads
  if (order && !newStatus) {
    setNewStatus(order.status);
  }

  const handleUpdateStatus = () => {
    if (!id || !newStatus) return;
    updateStatusMutation.mutate({
      id,
      data: {
        status: newStatus,
        note: internalNote || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton variant="rect" className="h-48 w-full rounded-card" />
            <Skeleton variant="rect" className="h-48 w-full rounded-card" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="rect" className="h-32 w-full rounded-card" />
            <Skeleton variant="rect" className="h-32 w-full rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">Error al cargar el pedido. Intenta de nuevo.</p>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE_MAP[order.status] ?? {
    label: order.status,
    variant: 'default' as const,
  };
  const paymentStatusInfo = order.payment
    ? PAYMENT_STATUS_MAP[order.payment.status] ?? { label: order.payment.status, variant: 'default' as const }
    : null;

  const providerLabel =
    order.payment?.provider === 'MERCADOPAGO'
      ? 'MercadoPago'
      : order.payment?.provider === 'DLOCAL_GO'
        ? 'dLocal Go'
        : order.payment?.provider ?? '-';

  // Build timeline - use statusHistory if available (from the backend response)
  const orderAny = order as unknown as { statusHistory?: { fromStatus: string | null; toStatus: string; note: string | null; createdAt: string }[] };
  const statusHistory = orderAny.statusHistory;
  const timeline = buildTimeline(order.status, order.createdAt, order.updatedAt, order.notes, statusHistory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="rounded-full p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              Pedido #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-400">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant={statusInfo.variant} className="self-start text-sm px-3 py-1">
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Admin actions */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-secondary">
                Acciones
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select
                    label="Cambiar estado"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    options={STATUS_OPTIONS}
                  />
                </div>
                <div className="self-end">
                  <Button
                    onClick={handleUpdateStatus}
                    size="md"
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Actualizar
                  </Button>
                </div>
              </div>
              <Textarea
                label="Nota interna"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Agrega una nota interna sobre este pedido..."
                className="min-h-[80px]"
              />
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-secondary">
                Estado del pedido
              </h2>
            </CardHeader>
            <CardBody>
              <div className="relative ml-4">
                {timeline.map((event, index) => {
                  const isLast = index === timeline.length - 1;
                  const Icon = event.icon;

                  return (
                    <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <div
                          className={cn(
                            'absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-12px)]',
                            event.isCompleted ? 'bg-success' : 'bg-gray-200',
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center h-8 w-8 rounded-full shrink-0',
                          event.isCompleted
                            ? 'bg-success text-white'
                            : event.isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-400',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p
                          className={cn(
                            'font-medium',
                            event.isCompleted || event.isCurrent
                              ? 'text-secondary'
                              : 'text-gray-400',
                          )}
                        >
                          {event.label}
                        </p>
                        {event.date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(event.date)}
                          </p>
                        )}
                        {event.note && (
                          <p className="text-xs text-gray-500 mt-0.5 italic">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-secondary">
                Productos ({order.items.length})
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="px-5 py-3 text-left font-medium text-gray-500">
                        Producto
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Precio
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Cant.
                      </th>
                      <th className="px-5 py-3 text-right font-medium text-gray-500">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl ?? PLACEHOLDER_IMAGE}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div>
                              <p className="font-medium text-secondary">
                                {item.name}
                              </p>
                              {item.variantName && (
                                <p className="text-xs text-gray-400">
                                  {item.variantName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {formatUYU(Number(item.price))}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-secondary">
                          {formatUYU(Number(item.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border">
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                        Subtotal
                      </td>
                      <td className="px-5 py-2 text-right text-secondary">
                        {formatUYU(Number(order.subtotal))}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                        Envio
                      </td>
                      <td className="px-5 py-2 text-right text-secondary">
                        {Number(order.shippingCost) === 0
                          ? 'Gratis'
                          : formatUYU(Number(order.shippingCost))}
                      </td>
                    </tr>
                    {Number(order.discount) > 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                          Descuento
                        </td>
                        <td className="px-5 py-2 text-right text-success">
                          -{formatUYU(Number(order.discount))}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t border-border">
                      <td
                        colSpan={3}
                        className="px-5 py-3 text-right font-bold text-secondary"
                      >
                        Total
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-lg text-secondary">
                        {formatUYU(Number(order.total))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Payment (hidden for warehouse role) */}
          {userRole !== 'WAREHOUSE' && order.payment && paymentStatusInfo && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-secondary">Pago</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Metodo</span>
                  <span className="font-medium text-secondary">{providerLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <Badge variant={paymentStatusInfo.variant}>
                    {paymentStatusInfo.label}
                  </Badge>
                </div>
                {order.payment.externalId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID externo</span>
                    <span className="font-mono text-xs text-gray-500">
                      {order.payment.externalId}
                    </span>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de pago</span>
                    <span className="text-secondary">
                      {formatDate(order.payment.paidAt)}
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-secondary">Envio</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-1 text-sm">
              <p className="font-medium text-secondary">
                {order.shippingAddress.street}
              </p>
              <p className="text-gray-500">
                {order.shippingAddress.city}, {order.shippingAddress.department}
              </p>
              <p className="text-gray-400">
                CP {order.shippingAddress.zipCode}
              </p>
              {order.shippingAddress.notes && (
                <p className="text-gray-500 italic mt-2">
                  Nota: {order.shippingAddress.notes}
                </p>
              )}
              {order.trackingNumber && (
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-gray-500">
                    <span className="font-medium text-secondary">Tracking:</span>{' '}
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
