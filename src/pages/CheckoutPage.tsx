import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Lock,
  User,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useCalculateShipping } from '@/hooks/useShipping';
import { useStoreSettings } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/auth.store';
import { createAddressApi } from '@/api/users.api';
import { createOrderApi } from '@/api/orders.api';
import { createPaymentApi } from '@/api/payments.api';
import { formatUYU } from '@/lib/format-currency';
import { cn } from '@/lib/cn';
import { URUGUAY_DEPARTMENTS, URUGUAY_CITIES } from '@/shared/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComboboxInput from '@/components/ui/ComboboxInput';
import Badge from '@/components/ui/Badge';
import type { CartItem } from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FREE_SHIPPING_THRESHOLD = 3000;
const BASE_SHIPPING_COST = 290;

const STEPS = [
  { number: 1, label: 'Datos personales', icon: User },
  { number: 2, label: 'Direccion de envio', icon: MapPin },
  { number: 3, label: 'Metodo de pago', icon: CreditCard },
] as const;

const DEPARTMENT_OPTIONS = URUGUAY_DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

const PAYMENT_PROVIDER_MAP = {
  mercadopago: 'MERCADOPAGO',
  dlocal: 'DLOCAL_GO',
  simulation: 'SIMULATION',
} as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  number: string;
  apartment: string;
  city: string;
  department: string;
  zipCode: string;
}

type PaymentMethod = 'mercadopago' | 'dlocal' | 'simulation' | null;

interface FormErrors {
  [key: string]: string;
}

/* ------------------------------------------------------------------ */
/*  CheckoutPage Component                                             */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Fetch real cart data
  const { data: cartData, isLoading: isLoadingCart } = useCart();
  const items: CartItem[] = cartData?.items ?? [];
  const subtotal = cartData?.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Store settings (payment method toggles)
  const { data: storeSettings } = useStoreSettings();

  // Shipping calculation mutation
  const calculateShipping = useCalculateShipping();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Personal data
  const [personalData, setPersonalData] = useState<PersonalData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Step 2: Shipping address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    number: '',
    apartment: '',
    city: '',
    department: '',
    zipCode: '',
  });

  // Step 3: Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Direction of animation
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // Shipping cost from API or fallback
  const [apiShippingCost, setApiShippingCost] = useState<number | null>(null);

  // Pre-fill personal data from logged-in user
  useEffect(() => {
    if (user) {
      setPersonalData((prev) => ({
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  /* ---- Computed values ---- */
  const shippingCost = apiShippingCost ?? BASE_SHIPPING_COST;
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingKnown = hasFreeShipping || !!shippingAddress.department;
  const finalShipping = hasFreeShipping ? 0 : shippingCost;
  const total = subtotal + (shippingKnown ? finalShipping : 0);

  /* ---- Validation ---- */
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!personalData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    if (!personalData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }
    if (!personalData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email)) {
      newErrors.email = 'Ingresa un email valido';
    }
    if (!personalData.phone.trim()) {
      newErrors.phone = 'El telefono es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!shippingAddress.street.trim()) {
      newErrors.street = 'La calle es obligatoria';
    }
    if (!shippingAddress.number.trim()) {
      newErrors.number = 'El numero es obligatorio';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }
    if (!shippingAddress.department) {
      newErrors.department = 'Selecciona un departamento';
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'El codigo postal es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Selecciona un metodo de pago';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---- Navigation ---- */
  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (isValid && currentStep < 3) {
      setSlideDirection('left');
      setErrors({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection('right');
      setErrors({});
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleConfirmOrder = async () => {
    if (!validateStep3() || !paymentMethod) return;

    setIsSubmitting(true);

    try {
      // 1. Create shipping address
      const address = await createAddressApi({
        label: 'Envio',
        recipientName: `${personalData.firstName} ${personalData.lastName}`,
        street: shippingAddress.street,
        number: shippingAddress.number,
        apartment: shippingAddress.apartment || undefined,
        city: shippingAddress.city,
        department: shippingAddress.department,
        postalCode: shippingAddress.zipCode,
        phone: personalData.phone || undefined,
      });

      // 2. Create order from cart
      const provider = PAYMENT_PROVIDER_MAP[paymentMethod];
      const order = await createOrderApi({
        addressId: address.id,
        paymentProvider: provider,
      });

      // 3. Create payment session and get redirect URL
      const payment = await createPaymentApi({
        orderId: order.id,
        provider,
      });

      // 4. Redirect to payment provider
      if (payment.provider === 'MERCADOPAGO') {
        const redirectUrl = payment.sandboxInitPoint || payment.initPoint;
        window.location.href = redirectUrl;
      } else {
        window.location.href = payment.paymentUrl;
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al procesar el pedido. Intenta de nuevo.';
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  /* ---- Render helpers ---- */
  const updatePersonalData = (field: keyof PersonalData, value: string) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // When department changes, calculate shipping cost and reset city
    if (field === 'department' && value) {
      const citiesForDept = URUGUAY_CITIES[value] ?? [];
      setShippingAddress((prev) => ({
        ...prev,
        city: citiesForDept.includes(prev.city) ? prev.city : '',
      }));
      calculateShipping.mutate(value, {
        onSuccess: (data) => {
          if (typeof data.cost === 'number') {
            setApiShippingCost(data.cost);
          }
        },
      });
    }
  };

  // Loading state
  if (isLoadingCart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-secondary-light">
        <Link to="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/carrito" className="transition-colors hover:text-primary">
          Carrito
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-secondary">Checkout</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-secondary sm:text-3xl">
        Finalizar compra
      </h1>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Main content: step form + order summary */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LEFT: Step form */}
        <div className="flex-1">
          <div className="rounded-card border border-border bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div
              className={cn(
                'transition-all duration-300 ease-in-out',
                slideDirection === 'left'
                  ? 'animate-slide-in-left'
                  : 'animate-slide-in-right',
              )}
              key={currentStep}
            >
              {currentStep === 1 && (
                <Step1PersonalData
                  data={personalData}
                  errors={errors}
                  onChange={updatePersonalData}
                />
              )}
              {currentStep === 2 && (
                <Step2ShippingAddress
                  data={shippingAddress}
                  errors={errors}
                  onChange={updateShippingAddress}
                  shippingCost={shippingCost}
                  hasFreeShipping={hasFreeShipping}
                  isCalculating={calculateShipping.isPending}
                />
              )}
              {currentStep === 3 && (
                <Step3PaymentMethod
                  selectedMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  error={errors.paymentMethod}
                  mpEnabled={storeSettings?.mpEnabled ?? false}
                  dlEnabled={storeSettings?.dlEnabled ?? false}
                />
              )}
            </div>

            {/* Step navigation buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                  <ChevronLeft className="h-4 w-4" />
                  Volver
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button variant="primary" onClick={handleNext}>
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmOrder}
                  isLoading={isSubmitting}
                >
                  Confirmar pedido
                </Button>
              )}
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-secondary-light">
              <Shield className="h-4 w-4 text-success" />
              <span>Pago seguro</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-secondary-light">
              <Lock className="h-4 w-4 text-success" />
              <span>Datos encriptados</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Order summary */}
        <div className="w-full shrink-0 lg:w-[360px]">
          <div className="sticky top-24 rounded-card border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-secondary">
              Tu pedido
            </h2>

            {/* Compact items list */}
            <ul className="space-y-3 mb-5">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-gray-50">
                        <CreditCard className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                    {item.quantity > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-secondary-light">
                      {item.quantity} x {formatUYU(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-secondary shrink-0">
                    {formatUYU(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Summary lines */}
            <div className="border-t border-border pt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary-light">Subtotal</span>
                <span className="font-medium text-secondary">
                  {formatUYU(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-light">Envio</span>
                {hasFreeShipping ? (
                  <Badge variant="success">Gratis</Badge>
                ) : shippingAddress.department ? (
                  <span className="font-medium text-secondary">
                    {formatUYU(finalShipping)}
                  </span>
                ) : (
                  <span className="text-xs text-secondary-light">
                    Segun departamento
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-secondary">
                  Total
                </span>
                <span className="text-xl font-bold text-secondary">
                  {formatUYU(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Step Indicator                                                     */
/* ================================================================== */

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isCompleted
                    ? 'border-success bg-success text-white'
                    : isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-secondary-light',
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium hidden sm:block',
                  isActive
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-success'
                      : 'text-secondary-light',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-12 sm:w-24 transition-colors duration-300',
                  isCompleted ? 'bg-success' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Step 1: Personal Data                                              */
/* ================================================================== */

interface Step1Props {
  data: PersonalData;
  errors: FormErrors;
  onChange: (field: keyof PersonalData, value: string) => void;
}

function Step1PersonalData({ data, errors, onChange }: Step1Props) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
          <User className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-secondary">Datos personales</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={data.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          error={errors.firstName}
        />
        <Input
          label="Apellido"
          placeholder="Tu apellido"
          value={data.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          error={errors.lastName}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Telefono"
          type="tel"
          placeholder="099 123 456"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Step 2: Shipping Address                                           */
/* ================================================================== */

interface Step2Props {
  data: ShippingAddress;
  errors: FormErrors;
  onChange: (field: keyof ShippingAddress, value: string) => void;
  shippingCost: number;
  hasFreeShipping: boolean;
  isCalculating: boolean;
}

function Step2ShippingAddress({
  data,
  errors,
  onChange,
  shippingCost,
  hasFreeShipping,
  isCalculating,
}: Step2Props) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
          <MapPin className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-secondary">
          Direccion de envio
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Calle"
          placeholder="Nombre de la calle"
          value={data.street}
          onChange={(e) => onChange('street', e.target.value)}
          error={errors.street}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Numero"
            placeholder="1234"
            value={data.number}
            onChange={(e) => onChange('number', e.target.value)}
            error={errors.number}
          />
          <Input
            label="Apto (opcional)"
            placeholder="Ej: 301"
            value={data.apartment}
            onChange={(e) => onChange('apartment', e.target.value)}
          />
        </div>
        <Select
          label="Departamento"
          placeholder="Selecciona tu departamento"
          options={DEPARTMENT_OPTIONS}
          value={data.department}
          onChange={(e) => onChange('department', e.target.value)}
          error={errors.department}
        />
        <ComboboxInput
          label="Ciudad"
          placeholder="Escribe tu ciudad"
          value={data.city}
          onChange={(val) => onChange('city', val)}
          suggestions={URUGUAY_CITIES[data.department] ?? []}
          error={errors.city}
        />
        <Input
          label="Codigo postal"
          placeholder="10000"
          value={data.zipCode}
          onChange={(e) => onChange('zipCode', e.target.value)}
          error={errors.zipCode}
        />
      </div>

      {/* Shipping cost calculation */}
      {data.department && (
        <div className="mt-6 rounded-lg border border-border bg-gray-50 p-4">
          <div className="flex items-center gap-2.5">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-secondary">
                Envio a {data.department}
              </p>
              {isCalculating ? (
                <p className="text-sm text-secondary-light flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Calculando costo de envio...
                </p>
              ) : hasFreeShipping ? (
                <p className="text-sm text-success font-semibold">
                  Gratis - tu compra supera los {formatUYU(FREE_SHIPPING_THRESHOLD)}
                </p>
              ) : (
                <p className="text-sm text-secondary-light">
                  Costo estimado: <span className="font-semibold text-secondary">{formatUYU(shippingCost)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Step 3: Payment Method                                             */
/* ================================================================== */

interface Step3Props {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  error?: string;
  mpEnabled: boolean;
  dlEnabled: boolean;
}

function Step3PaymentMethod({ selectedMethod, onSelectMethod, error, mpEnabled, dlEnabled }: Step3Props) {
  const hasAnyMethod = mpEnabled || dlEnabled || import.meta.env.DEV;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
          <CreditCard className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-secondary">Metodo de pago</h2>
      </div>

      {!hasAnyMethod && (
        <p className="text-sm text-gray-500 py-6 text-center">
          No hay metodos de pago disponibles en este momento. Por favor, intenta mas tarde.
        </p>
      )}

      <div className="space-y-4">
        {/* MercadoPago */}
        {mpEnabled && <button
          type="button"
          onClick={() => onSelectMethod('mercadopago')}
          className={cn(
            'w-full rounded-card border-2 p-5 text-left transition-all duration-200',
            selectedMethod === 'mercadopago'
              ? 'border-primary bg-primary-light shadow-sm'
              : 'border-border bg-white hover:border-gray-300 hover:shadow-sm',
          )}
        >
          <div className="flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <span className="text-lg font-bold text-blue-600">MP</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-secondary">
                MercadoPago
              </p>
              <p className="text-xs text-secondary-light mt-0.5">
                Tarjetas, transferencia y mas
              </p>
            </div>
            {/* Radio indicator */}
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selectedMethod === 'mercadopago'
                  ? 'border-primary'
                  : 'border-gray-300',
              )}
            >
              {selectedMethod === 'mercadopago' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
          </div>
        </button>}

        {/* dLocal Go */}
        {dlEnabled && <button
          type="button"
          onClick={() => onSelectMethod('dlocal')}
          className={cn(
            'w-full rounded-card border-2 p-5 text-left transition-all duration-200',
            selectedMethod === 'dlocal'
              ? 'border-primary bg-primary-light shadow-sm'
              : 'border-border bg-white hover:border-gray-300 hover:shadow-sm',
          )}
        >
          <div className="flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <span className="text-lg font-bold text-green-600">dL</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-secondary">
                dLocal Go
              </p>
              <p className="text-xs text-secondary-light mt-0.5">
                Paga con dLocal
              </p>
            </div>
            {/* Radio indicator */}
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selectedMethod === 'dlocal'
                  ? 'border-primary'
                  : 'border-gray-300',
              )}
            >
              {selectedMethod === 'dlocal' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
          </div>
        </button>}

        {/* Simulation (dev only) */}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => onSelectMethod('simulation')}
            className={cn(
              'w-full rounded-card border-2 p-5 text-left transition-all duration-200',
              selectedMethod === 'simulation'
                ? 'border-amber-500 bg-amber-50 shadow-sm'
                : 'border-dashed border-amber-300 bg-white hover:border-amber-400 hover:shadow-sm',
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <span className="text-lg font-bold text-amber-600">SIM</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-secondary">
                  Simulacion (dev)
                </p>
                <p className="text-xs text-secondary-light mt-0.5">
                  Aprobar o rechazar pago manualmente
                </p>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  selectedMethod === 'simulation'
                    ? 'border-amber-500'
                    : 'border-gray-300',
                )}
              >
                {selectedMethod === 'simulation' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                )}
              </div>
            </div>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
