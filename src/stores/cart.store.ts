import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  toggleDrawer: () => void;
  setLoading: (isLoading: boolean) => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  setItems: (items: CartItem[]) => set({ items }),

  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  totalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
