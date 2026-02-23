import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useOrderById } from '@/hooks/useOrders';
import Button from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { data: order, isLoading } = useOrderById(orderId ?? undefined);

  const orderNumber = order?.orderNumber ?? orderId ?? '';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      {/* Confetti-like background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-confetti"
            style={{
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              backgroundColor: ['#E85D2C', '#F5A623', '#22C55E', '#3B82F6'][i % 4],
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center max-w-md">
        {/* Animated checkmark circle */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success animate-scale-in-delay">
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: 24,
                    animation: 'checkDraw 0.5s ease-out 0.5s forwards',
                  }}
                />
              </svg>
            </div>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-success/20 animate-ping-slow" />
        </div>

        <h1 className="text-3xl font-bold text-secondary mb-2">
          Pago exitoso!
        </h1>
        <p className="text-lg text-gray-500 mb-4">
          Tu pedido ha sido confirmado
        </p>

        <div className="bg-gray-50 rounded-card px-6 py-4 mb-4 w-full">
          <p className="text-sm text-gray-400 mb-1">Numero de pedido</p>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-secondary mx-auto" />
          ) : (
            <p className="text-xl font-bold text-secondary">{orderNumber}</p>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-8">
          Te enviamos un email con los detalles de tu pedido
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to={orderId ? `/mi-cuenta/pedidos/${orderId}` : '/mi-cuenta/pedidos'} className="flex-1">
            <Button fullWidth>Ver mi pedido</Button>
          </Link>
          <Link to="/productos" className="flex-1">
            <Button variant="outline" fullWidth>
              Seguir comprando
            </Button>
          </Link>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes checkDraw {
          to {
            stroke-dashoffset: 0;
          }
        }

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

        @keyframes pingSlow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-scale-in-delay {
          animation: scaleIn 0.4s ease-out 0.2s both;
        }

        .animate-ping-slow {
          animation: pingSlow 2s ease-out infinite;
        }

        .animate-confetti {
          animation: confettiFall 5s ease-in infinite;
        }
      `}</style>
    </div>
  );
}
