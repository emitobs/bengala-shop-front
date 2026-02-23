import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Truck, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import { formatUYU } from '@/lib/format-currency';
import { cn } from '@/lib/cn';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import type { CartItem } from '@/types';

const FREE_SHIPPING_THRESHOLD = 3000;

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  // Fetch real cart data
  const { data: cartData, isLoading } = useCart();

  // Mutations for updating and removing items
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  // Cart API returns { items, subtotal, itemCount }
  const items: CartItem[] = cartData?.items ?? [];
  const totalItems = cartData?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartData?.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const handleNavigate = () => {
    toggleDrawer();
  };

  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={toggleDrawer}
      title="Tu Carrito"
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Tu carrito esta vacio"
          description="Empeza a agregar productos"
          actionLabel="Ir a productos"
          onAction={() => {
            toggleDrawer();
            window.location.href = '/productos';
          }}
        />
      ) : (
        <div className="flex h-full flex-col">
          {/* Badge with total items count */}
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="default">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>

          {/* Cart items list */}
          <ul className="flex-1 -mx-5 divide-y divide-border overflow-y-auto px-5">
            {items.map((item) => (
              <CartDrawerItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onNavigate={handleNavigate}
              />
            ))}
          </ul>

          {/* Sticky bottom section */}
          <div className="-mx-5 mt-auto border-t border-border bg-white px-5 pt-4 pb-2 shrink-0">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-secondary-light">
                Subtotal
              </span>
              <span className="text-lg font-bold text-secondary">
                {formatUYU(subtotal)}
              </span>
            </div>

            {/* Shipping threshold info */}
            <div className="mb-4">
              {hasFreeShipping ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <Truck className="h-4 w-4 shrink-0 text-success" />
                  <Badge variant="success">Envio gratis!</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                  <Truck className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-xs text-amber-700">
                    Envio gratis a partir de {formatUYU(FREE_SHIPPING_THRESHOLD)}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Link to="/checkout" onClick={handleNavigate}>
                <Button variant="primary" fullWidth>
                  Finalizar compra
                </Button>
              </Link>
              <Link to="/carrito" onClick={handleNavigate}>
                <Button variant="secondary" fullWidth>
                  Ir al carrito
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart Drawer Item Component                                         */
/* ------------------------------------------------------------------ */

interface CartDrawerItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onNavigate: () => void;
}

function CartDrawerItem({
  item,
  onUpdateQuantity,
  onRemove,
  onNavigate,
}: CartDrawerItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex gap-3 py-4">
      {/* Product image */}
      <Link
        to={`/productos/${item.slug}`}
        onClick={onNavigate}
        className="shrink-0"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-16 w-16 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-gray-50">
            <ShoppingCart className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </Link>

      {/* Item details */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/productos/${item.slug}`}
              onClick={onNavigate}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            {item.variantName && (
              <p className="text-xs text-secondary-light mt-0.5">
                {item.variantName}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-error"
            aria-label={`Eliminar ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Unit price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-secondary-light">
            {formatUYU(item.price)}
          </span>
          {item.compareAtPrice && item.compareAtPrice > item.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatUYU(item.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Quantity controls */}
          <div className="inline-flex items-center rounded-xl border border-border">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-l-xl text-secondary-light transition-colors',
                item.quantity <= 1
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-gray-100 hover:text-secondary active:bg-gray-200',
              )}
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-9 w-9 items-center justify-center border-x border-border text-sm font-medium text-secondary">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-r-xl text-secondary-light transition-colors',
                item.quantity >= item.stock
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-gray-100 hover:text-secondary active:bg-gray-200',
              )}
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-semibold text-secondary">
            {formatUYU(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}
