import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderById } from '@/hooks/useOrders';
import { confirmSimulationPaymentApi } from '@/api/payments.api';
import { formatUYU } from '@/lib/format-currency';
import Button from '@/components/ui/Button';

export default function PaymentSimulationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  const { data: order, isLoading } = useOrderById(orderId ?? undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!orderId) return;
    setIsProcessing(true);

    try {
      await confirmSimulationPaymentApi({ orderId, action });

      if (action === 'approve') {
        navigate(`/pago/exito?order=${orderId}`, { replace: true });
      } else {
        navigate(`/pago/error?order=${orderId}`, { replace: true });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al procesar la simulacion';
      toast.error(message);
      setIsProcessing(false);
    }
  };

  if (!orderId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <p className="text-secondary-light">No se encontro el pedido</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">
            Simulacion de pago
          </h1>
          <p className="mt-2 text-sm text-secondary-light">
            Modo de desarrollo — este pago no es real
          </p>
        </div>

        {/* Order summary */}
        <div className="mb-8 rounded-card border border-border bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : order ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-light">Pedido</span>
                <span className="text-sm font-semibold text-secondary">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-light">Productos</span>
                <span className="text-sm text-secondary">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-secondary">Total</span>
                  <span className="text-xl font-bold text-secondary">
                    {formatUYU(order.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-secondary-light">
              No se pudo cargar el pedido
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => handleAction('approve')}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            <CheckCircle className="h-5 w-5" />
            Aprobar pago
          </Button>
          <Button
            variant="outline"
            fullWidth
            size="lg"
            onClick={() => handleAction('reject')}
            disabled={isProcessing}
          >
            <XCircle className="h-5 w-5" />
            Rechazar pago
          </Button>
        </div>

        {/* Dev notice */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Esta pagina solo esta disponible en modo desarrollo
        </p>
      </div>
    </div>
  );
}
