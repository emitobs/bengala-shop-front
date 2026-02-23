import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { useOrderById } from '@/hooks/useOrders';
import Button from '@/components/ui/Button';

export default function PaymentPendingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { data: order, isLoading } = useOrderById(orderId ?? undefined);

  const orderNumber = order?.orderNumber ?? orderId ?? '';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Animated clock circle */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent animate-scale-in-delay">
              <Clock className="h-8 w-8 text-white animate-pulse-subtle" />
            </div>
          </div>
          {/* Subtle rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent/40 animate-spin-slow" />
        </div>

        <h1 className="text-3xl font-bold text-secondary mb-2">
          Tu pago esta pendiente
        </h1>
        <p className="text-lg text-gray-500 mb-4">
          Estamos esperando la confirmacion del pago. Te avisaremos por email.
        </p>

        <div className="bg-gray-50 rounded-card px-6 py-4 mb-8 w-full">
          <p className="text-sm text-gray-400 mb-1">Numero de pedido</p>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-secondary mx-auto" />
          ) : (
            <p className="text-xl font-bold text-secondary">{orderNumber}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to={orderId ? `/mi-cuenta/pedidos/${orderId}` : '/mi-cuenta/pedidos'} className="flex-1">
            <Button fullWidth>Ver mi pedido</Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="outline" fullWidth>
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulseSubtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-scale-in-delay {
          animation: scaleIn 0.4s ease-out 0.2s both;
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spinSlow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
