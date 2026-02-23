import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  CreditCard,
  Shield,
  Truck,
  Landmark,
  Tag,
  Loader2,
} from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/useCart';
import { useValidateCoupon, getCouponErrorMessage } from '@/hooks/useCoupons';
import { formatUYU } from '@/lib/format-currency';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import type { CartItem } from '@/types';

const FREE_SHIPPING_THRESHOLD = 3000;
const SHIPPING_COST = 290;

export default function CartPage() {
  const navigate = useNavigate();

  // Fetch real cart data
  const { data: cartData, isLoading } = useCart();

  // Mutations
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

  // Cart API returns { items, subtotal, itemCount }
  const items: CartItem[] = cartData?.items ?? [];
  const totalItems = cartData?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartData?.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const validateCoupon = useValidateCoupon();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const handleClearCart = () => {
    clearCart.mutate();
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Ingresa un codigo de cupon');
      return;
    }
    validateCoupon.mutate(
      { code: couponCode.trim(), subtotal },
      {
        onSuccess: (result) => {
          setAppliedDiscount(result.discount);
          setAppliedCouponCode(result.code);
        },
        onError: (error) => {
          setCouponError(getCouponErrorMessage(error));
          setAppliedDiscount(0);
          setAppliedCouponCode('');
        },
      },
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponCode('');
    setCouponCode('');
    setCouponError('');
  };

  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = hasFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost - appliedDiscount;

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-secondary-light">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-secondary">Carrito</span>
        </nav>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-secondary-light">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-secondary">Carrito</span>
        </nav>

        <EmptyState
          icon={ShoppingCart}
          title="Tu carrito esta vacio"
          description="Explora nuestro catalogo y encontra lo que necesitas"
          actionLabel="Ver productos"
          onAction={() => navigate('/productos')}
        />
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
        <span className="font-medium text-secondary">Carrito</span>
      </nav>

      {/* Title */}
      <h1 className="mb-8 text-2xl font-bold text-secondary sm:text-3xl">
        Carrito de compras
        <span className="ml-2 text-lg font-normal text-secondary-light">
          ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
        </span>
      </h1>

      {/* Two column layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LEFT: Cart items */}
        <div className="flex-1">
          <div className="rounded-card border border-border bg-white shadow-sm">
            {/* Table header (desktop only) */}
            <div className="hidden border-b border-border px-6 py-3 sm:grid sm:grid-cols-[1fr_140px_120px_40px] sm:items-center sm:gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary-light">
                Producto
              </span>
              <span className="text-center text-xs font-semibold uppercase tracking-wider text-secondary-light">
                Cantidad
              </span>
              <span className="text-right text-xs font-semibold uppercase tracking-wider text-secondary-light">
                Total
              </span>
              <span />
            </div>

            {/* Cart items list */}
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </ul>

            {/* Clear cart link */}
            <div className="border-t border-border px-6 py-4">
              <button
                onClick={handleClearCart}
                className="text-sm text-secondary-light underline-offset-2 transition-colors hover:text-error hover:underline"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Order summary sidebar */}
        <div className="w-full shrink-0 lg:w-[380px]">
          <div className="sticky top-24 rounded-card border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-secondary">
              Resumen del pedido
            </h2>

            {/* Summary lines */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary-light">
                  Subtotal ({totalItems}{' '}
                  {totalItems === 1 ? 'producto' : 'productos'})
                </span>
                <span className="font-medium text-secondary">
                  {formatUYU(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-light">Envio estimado</span>
                {hasFreeShipping ? (
                  <Badge variant="success">Gratis</Badge>
                ) : (
                  <span className="font-medium text-secondary">
                    {formatUYU(shippingCost)}
                  </span>
                )}
              </div>
              {appliedDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-success">Descuento</span>
                  <span className="font-medium text-success">
                    -{formatUYU(appliedDiscount)}
                  </span>
                </div>
              )}
            </div>

            {/* Free shipping progress */}
            {!hasFreeShipping && (
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-xs text-amber-700">
                    Te faltan {formatUYU(FREE_SHIPPING_THRESHOLD - subtotal)} para envio gratis
                  </span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-5 border-t border-border" />

            {/* Total */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-base font-semibold text-secondary">
                Total
              </span>
              <span className="text-xl font-bold text-secondary">
                {formatUYU(total)}
              </span>
            </div>

            {/* Coupon code */}
            <div className="mb-5">
              {appliedCouponCode ? (
                <div className="flex items-center justify-between rounded-lg bg-success/5 border border-success/20 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-success">
                      Cupon {appliedCouponCode} aplicado
                    </p>
                    <p className="text-xs text-success/70">
                      Descuento: -{formatUYU(appliedDiscount)}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-gray-400 hover:text-error transition-colors underline"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Codigo de cupon"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        error={couponError}
                        icon={<Tag className="h-4 w-4" />}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleApplyCoupon}
                      isLoading={validateCoupon.isPending}
                      className="shrink-0"
                    >
                      Aplicar
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Checkout button */}
            <Link to={appliedCouponCode ? `/checkout?coupon=${encodeURIComponent(appliedCouponCode)}` : '/checkout'}>
              <Button variant="primary" size="lg" fullWidth>
                Finalizar compra
              </Button>
            </Link>

            {/* Payment method icons */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2">
                <CreditCard className="h-4 w-4 text-secondary-light" />
                <span className="text-[11px] text-secondary-light">Tarjetas</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2">
                <Landmark className="h-4 w-4 text-secondary-light" />
                <span className="text-[11px] text-secondary-light">Transferencia</span>
              </div>
            </div>

            {/* Continue shopping */}
            <div className="mt-4 text-center">
              <Link
                to="/productos"
                className="text-sm font-medium text-primary underline-offset-2 transition-colors hover:text-primary-dark hover:underline"
              >
                Seguir comprando
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-6 border-t border-border pt-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-secondary-light">
                  <Shield className="h-4 w-4 shrink-0 text-success" />
                  <span>Compra segura con encriptacion SSL</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-secondary-light">
                  <CreditCard className="h-4 w-4 shrink-0 text-success" />
                  <span>MercadoPago, Visa, Mastercard, OCA</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-secondary-light">
                  <Truck className="h-4 w-4 shrink-0 text-success" />
                  <span>Envio gratis en compras mayores a $3.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart Item Row Component                                           */
/* ------------------------------------------------------------------ */

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <li className="px-6 py-5 sm:grid sm:grid-cols-[1fr_140px_120px_40px] sm:items-center sm:gap-4">
      {/* Product info */}
      <div className="flex gap-4">
        {/* Image */}
        <Link to={`/productos/${item.slug}`} className="shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-20 w-20 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-gray-50">
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </Link>

        {/* Name + variant + unit price + SKU */}
        <div className="flex flex-col justify-center gap-1 min-w-0">
          <Link
            to={`/productos/${item.slug}`}
            className="text-sm font-semibold text-secondary transition-colors hover:text-primary line-clamp-2 sm:text-base"
          >
            {item.name}
          </Link>
          {item.variantName && (
            <p className="text-xs text-secondary-light">
              Variante: {item.variantName}
            </p>
          )}
          <p className="text-[11px] text-gray-400 uppercase tracking-wider">
            SKU: {item.productId}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-secondary-light">
              {formatUYU(item.price)} c/u
            </span>
            {item.compareAtPrice && item.compareAtPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatUYU(item.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity controls (mobile: inline below, desktop: grid column) */}
      <div className="mt-4 flex items-center justify-between sm:mt-0 sm:justify-center">
        <div className="inline-flex items-center rounded-lg border border-border">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-l-lg text-secondary-light transition-colors',
              item.quantity <= 1
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-gray-100 hover:text-secondary',
            )}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm font-medium text-secondary">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-r-lg text-secondary-light transition-colors',
              item.quantity >= item.stock
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-gray-100 hover:text-secondary',
            )}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line total - shown on mobile inline */}
        <span className="text-base font-bold text-secondary sm:hidden">
          {formatUYU(lineTotal)}
        </span>
      </div>

      {/* Line total (desktop grid column) */}
      <div className="hidden text-right sm:block">
        <span className="text-base font-bold text-secondary">
          {formatUYU(lineTotal)}
        </span>
      </div>

      {/* Remove button */}
      <div className="hidden sm:flex sm:justify-center">
        <button
          onClick={() => onRemove(item.id)}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-error"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </li>
  );
}
