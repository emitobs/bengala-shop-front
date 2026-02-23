export interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  provider: 'MERCADOPAGO' | 'DLOCAL_GO' | 'SIMULATION';
  externalId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' | 'IN_PROCESS';
  amount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    department: string;
    zipCode: string;
    notes: string | null;
  };
  items: OrderItem[];
  payment: Payment | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
