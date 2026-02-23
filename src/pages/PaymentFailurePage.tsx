import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Animated X circle */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-error/10 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error animate-scale-in-delay">
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  style={{
                    strokeDasharray: 17,
                    strokeDashoffset: 17,
                    animation: 'xDraw 0.3s ease-out 0.5s forwards',
                  }}
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  style={{
                    strokeDasharray: 17,
                    strokeDashoffset: 17,
                    animation: 'xDraw 0.3s ease-out 0.7s forwards',
                  }}
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-secondary mb-2">
          El pago no pudo procesarse
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Podes intentar de nuevo o elegir otro metodo de pago
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to="/checkout" className="flex-1">
            <Button fullWidth>Intentar de nuevo</Button>
          </Link>
          <Link to="/carrito" className="flex-1">
            <Button variant="outline" fullWidth>
              Volver al carrito
            </Button>
          </Link>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes xDraw {
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

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-scale-in-delay {
          animation: scaleIn 0.4s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}
