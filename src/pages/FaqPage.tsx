import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Truck,
  CreditCard,
  RefreshCw,
  UserCircle,
  Package,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen((prev) => !prev)}
      className="flex w-full flex-col text-left"
      aria-expanded={isOpen}
    >
      <div className="flex w-full items-center justify-between gap-4 px-5 py-4">
        <span className="text-sm font-medium text-secondary">{question}</span>
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200',
            isOpen
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-400',
          )}
        >
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </span>
      </div>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96' : 'max-h-0',
        )}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed text-gray-500">
          {answer}
        </p>
      </div>
    </button>
  );
}

const FAQ_SECTIONS = [
  {
    title: 'Envios',
    icon: Truck,
    color: 'bg-blue-50 text-blue-600',
    items: [
      {
        question: '¿A donde realizan envios?',
        answer:
          'Realizamos envios a todo el territorio de Uruguay. Despachamos desde nuestros depositos en Fray Bentos y Mercedes.',
      },
      {
        question: '¿Cuanto tarda en llegar mi pedido?',
        answer:
          'Los plazos de entrega dependen de la localidad de destino. En general, los pedidos se entregan entre 2 y 7 dias habiles a partir de la confirmacion del pago. Para Fray Bentos y Mercedes la entrega suele ser mas rapida (1-2 dias habiles).',
      },
      {
        question: '¿Cuanto cuesta el envio?',
        answer:
          'El costo de envio se calcula automaticamente al momento de la compra en base a la direccion de destino y el peso del pedido. Las compras superiores a $3.000 UYU cuentan con envio gratuito a todo el pais.',
      },
      {
        question: '¿Puedo rastrear mi pedido?',
        answer:
          'Si, una vez despachado tu pedido recibiras un email con el numero de seguimiento para que puedas rastrear el envio en todo momento. Tambien podes consultar el estado desde la seccion "Mis Pedidos" en tu cuenta.',
      },
    ],
  },
  {
    title: 'Pagos',
    icon: CreditCard,
    color: 'bg-green-50 text-green-600',
    items: [
      {
        question: '¿Que medios de pago aceptan?',
        answer:
          'Aceptamos tarjetas de credito y debito a traves de MercadoPago y dLocal Go, asi como transferencia bancaria directa. Todos los precios estan en Pesos Uruguayos (UYU).',
      },
      {
        question: '¿Puedo pagar en cuotas?',
        answer:
          'Si, a traves de MercadoPago y dLocal Go podes pagar con tarjeta de credito en cuotas. Las opciones de financiacion disponibles se muestran al momento del checkout.',
      },
      {
        question: '¿Es seguro pagar en el sitio?',
        answer:
          'Absolutamente. Nuestro sitio utiliza encriptacion SSL/TLS y no almacenamos datos de tarjetas. Los pagos son procesados de forma segura a traves de MercadoPago y dLocal Go, plataformas certificadas internacionalmente.',
      },
    ],
  },
  {
    title: 'Devoluciones y cambios',
    icon: RefreshCw,
    color: 'bg-orange-50 text-orange-600',
    items: [
      {
        question: '¿Puedo devolver un producto?',
        answer:
          'Si, aceptamos devoluciones dentro de los 30 dias corridos desde la recepcion del producto. El producto debe estar en su estado original, sin uso, con embalaje y etiquetas. Consulta nuestra Politica de Devoluciones para mas detalles.',
      },
      {
        question: '¿Como inicio una devolucion?',
        answer:
          'Contactanos por email a contacto@bengalamax.com o por telefono al +598 99 123 456 indicando tu numero de pedido y el motivo. Nuestro equipo te respondera dentro de las 48 horas habiles.',
      },
      {
        question: '¿Cuanto tarda el reembolso?',
        answer:
          'Una vez aprobada la devolucion y recibido el producto, el reembolso se procesa en un plazo de 5 a 10 dias habiles, dependiendo del medio de pago y la entidad bancaria.',
      },
    ],
  },
  {
    title: 'Mi cuenta',
    icon: UserCircle,
    color: 'bg-purple-50 text-purple-600',
    items: [
      {
        question: '¿Necesito registrarme para comprar?',
        answer:
          'Si, necesitas crear una cuenta para realizar compras. El registro es rapido y gratuito. Solo necesitas tu nombre, email y una contraseña.',
      },
      {
        question: '¿Como recupero mi contraseña?',
        answer:
          'En la pagina de inicio de sesion, hace clic en "Olvidaste tu contraseña?" e ingresa tu email. Recibiras un enlace para restablecer tu contraseña.',
      },
      {
        question: '¿Como puedo modificar mis datos personales?',
        answer:
          'Ingresa a tu cuenta y ve a la seccion "Mi Cuenta" donde podras actualizar tu nombre, email, telefono y direcciones de envio.',
      },
    ],
  },
  {
    title: 'Productos',
    icon: Package,
    color: 'bg-pink-50 text-pink-600',
    items: [
      {
        question: '¿Los productos tienen garantia?',
        answer:
          'Si, todos nuestros productos cuentan con la garantia del fabricante. En caso de defectos de fabrica, contactanos y gestionaremos el reclamo. Ademas, tenes 30 dias para devoluciones por cualquier motivo.',
      },
      {
        question: '¿Que hago si un producto esta agotado?',
        answer:
          'Si un producto se encuentra agotado, podes contactarnos para consultar cuando estara disponible nuevamente. Tambien podes hablar con Rayitas, nuestro asistente virtual, que te ayudara a encontrar alternativas similares.',
      },
      {
        question: '¿Las fotos de los productos son reales?',
        answer:
          'Las fotografias son lo mas fieles posible al producto real. Sin embargo, pueden existir variaciones menores de color debido a la configuracion de pantalla de cada dispositivo.',
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary sm:text-4xl">
          Preguntas Frecuentes
        </h1>
        <p className="mt-3 text-gray-500">
          Encontra respuestas a las consultas mas comunes sobre Bengala Max.
        </p>
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-8">
        {FAQ_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title}>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    section.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-secondary">
                  {section.title}
                </h2>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                {section.items.map((item) => (
                  <FaqItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-8 text-center text-white shadow-lg sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <MessageCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold">
          ¿No encontraste lo que buscabas?
        </h3>
        <p className="mt-2 text-sm text-white/80">
          Habla con <strong className="text-white">Rayitas</strong>, nuestro
          asistente virtual, o escribinos a{' '}
          <a
            href="mailto:contacto@bengalamax.com"
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            contacto@bengalamax.com
          </a>
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/politica-de-devoluciones"
            className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/30"
          >
            Politica de devoluciones
          </Link>
          <Link
            to="/terminos-y-condiciones"
            className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/30"
          >
            Terminos y condiciones
          </Link>
        </div>
      </div>
    </div>
  );
}
