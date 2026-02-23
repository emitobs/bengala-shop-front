import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: true,

      setAuth: (user: User, token: string) =>
        set({ user, accessToken: token, isLoading: false }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isLoading: false }),

      setLoading: (isLoading: boolean) =>
        set({ isLoading }),
    }),
    {
      name: 'bengala-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
