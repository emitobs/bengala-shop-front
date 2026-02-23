import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatUYU } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { useOrderById } from '@/hooks/useOrders';
import type { Order } from '@/types/order.types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

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

interface TimelineEvent {
  status: string;
  label: string;
  date: string;
  note: string | null;
  icon: typeof Check;
  isCompleted: boolean;
  isCurrent: boolean;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/80x80/1E1E2E/E85D2C?text=BM';

function buildTimeline(order: Order): TimelineEvent[] {
  const statusOrder: { status: Order['status']; label: string; icon: typeof Check }[] = [
    { status: 'PENDING', label: 'Pedido creado', icon: Package },
    { status: 'PAID', label: 'Pago confirmado', icon: CreditCard },
    { status: 'PROCESSING', label: 'En preparacion', icon: Clock },
    { status: 'SHIPPED', label: 'Enviado', icon: Truck },
    { status: 'DELIVERED', label: 'Entregado', icon: Check },
  ];

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    return [
      {
        status: 'PENDING',
        label: 'Pedido creado',
        date: order.createdAt,
        note: null,
        icon: Package,
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: order.status,
        label: order.status === 'CANCELLED' ? 'Cancelado' : 'Reembolsado',
        date: order.updatedAt,
        note: order.notes,
        icon: XCircle,
        isCompleted: false,
        isCurrent: true,
      },
    ];
  }

  const currentIndex = statusOrder.findIndex((s) => s.status === order.status);

  return statusOrder.map((step, index) => ({
    status: step.status,
    label: step.label,
    date:
      index === 0
        ? order.createdAt
        : index <= currentIndex
          ? order.updatedAt
          : '',
    note: index === currentIndex ? order.notes : null,
    icon: step.icon,
    isCompleted: index < currentIndex,
    isCurrent: index === currentIndex,
  }));
}

function OrderDetailSkeleton() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <Skeleton variant="text" className="h-8 w-64 mb-2" />
          <Skeleton variant="text" className="h-4 w-40" />
        </div>
        <Skeleton variant="rect" className="h-8 w-24" />
      </div>

      {/* Timeline skeleton */}
      <Card className="mb-8">
        <CardHeader>
          <Skeleton variant="text" className="h-6 w-48" />
        </CardHeader>
        <CardBody>
          <div className="space-y-6 ml-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton variant="circle" className="h-8 w-8" />
                <div className="space-y-1">
                  <Skeleton variant="text" className="h-5 w-32" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Items + Summary skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-32" />
          </CardHeader>
          <CardBody className="p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0">
                <Skeleton variant="rect" className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-5 w-48" />
                  <Skeleton variant="text" className="h-4 w-32" />
                </div>
                <Skeleton variant="text" className="h-5 w-20" />
              </div>
            ))}
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardBody>
              <div className="space-y-3">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-6 w-full mt-3" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderById(id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Mi Cuenta', href: '/mi-cuenta' },
          { label: 'Mis Pedidos', href: '/mi-cuenta/pedidos' },
          { label: order ? `Pedido #${order.orderNumber}` : 'Cargando...' },
        ]}
        className="mb-6"
      />

      {/* Loading state */}
      {isLoading && <OrderDetailSkeleton />}

      {/* Error state */}
      {isError && (
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" />
            <p className="text-gray-500">
              No se pudo cargar el detalle del pedido. Intenta de nuevo mas tarde.
            </p>
            <Link
              to="/mi-cuenta/pedidos"
              className="mt-4 inline-block text-primary hover:underline text-sm"
            >
              Volver a mis pedidos
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Order detail content */}
      {!isLoading && !isError && order && (
        <OrderDetailContent order={order} />
      )}
    </div>
  );
}

function OrderDetailContent({ order }: { order: Order }) {
  const timeline = buildTimeline(order);
  const statusInfo = STATUS_BADGE_MAP[order.status];

  const providerLabel =
    order.payment?.provider === 'MERCADOPAGO'
      ? 'MercadoPago'
      : order.payment?.provider === 'DLOCAL_GO'
        ? 'dLocal Go'
        : '-';

  const paymentStatusInfo = order.payment
    ? PAYMENT_STATUS_MAP[order.payment.status]
    : null;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Realizado el {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusInfo.variant} className="self-start text-sm px-3 py-1">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-secondary">
            Estado del pedido
          </h2>
        </CardHeader>
        <CardBody>
          <div className="relative ml-4">
            {timeline.map((event, index) => {
              const isLast = index === timeline.length - 1;
              const Icon = event.icon;

              return (
                <div key={event.status} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-16px)]',
                        event.isCompleted ? 'bg-success' : 'bg-gray-200',
                      )}
                    />
                  )}

                  {/* Dot / Icon */}
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

                  {/* Content */}
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
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-secondary">
                  Numero de seguimiento:
                </span>{' '}
                {order.trackingNumber}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Two columns: Items + Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT: Items */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary">
              Productos ({order.items.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <img
                    src={item.imageUrl ?? PLACEHOLDER_IMAGE}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary truncate">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="text-sm text-gray-400">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatUYU(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-secondary shrink-0">
                    {formatUYU(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* RIGHT: Summary */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary">
                Resumen
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-secondary">
                    {formatUYU(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envio</span>
                  <span className="text-secondary">
                    {order.shippingCost === 0
                      ? 'Gratis'
                      : formatUYU(order.shippingCost)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="text-success">
                      -{formatUYU(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-bold text-secondary">Total</span>
                  <span className="font-bold text-lg text-secondary">
                    {formatUYU(order.total)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Payment info */}
          {order.payment && paymentStatusInfo && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-secondary">Pago</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metodo</span>
                    <span className="text-secondary font-medium">
                      {providerLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Estado</span>
                    <Badge variant={paymentStatusInfo.variant}>
                      {paymentStatusInfo.label}
                    </Badge>
                  </div>
                  {order.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha de pago</span>
                      <span className="text-secondary">
                        {formatDate(order.payment.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-secondary">
                  Direccion de envio
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-sm space-y-1">
                <p className="text-secondary font-medium">
                  {order.shippingAddress.street}
                </p>
                <p className="text-gray-500">
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.department}
                </p>
                <p className="text-gray-400">
                  CP {order.shippingAddress.zipCode}
                </p>
                {order.shippingAddress.notes && (
                  <p className="text-gray-500 italic mt-2">
                    Nota: {order.shippingAddress.notes}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Help */}
          <Link
            to="/contacto"
            className="flex items-center gap-2 text-sm text-primary hover:underline px-1"
          >
            <HelpCircle className="h-4 w-4" />
            Necesitas ayuda con este pedido?
          </Link>
        </div>
      </div>
    </>
  );
}
