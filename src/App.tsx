import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router';
import { useAuthStore } from '@/stores/auth.store';
import { refreshTokenApi } from '@/api/auth.api';

const REFRESH_TOKEN_KEY = 'bengala-refresh-token';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // If we already have an access token (from current session), skip refresh
    if (accessToken) {
      setLoading(false);
      return;
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      setLoading(false);
      return;
    }

    // Try to refresh the session using stored refresh token
    refreshTokenApi(refreshToken)
      .then((response) => {
        setAuth(response.user, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      })
      .catch(() => {
        // Refresh failed - clear stale data
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        useAuthStore.getState().clearAuth();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}
