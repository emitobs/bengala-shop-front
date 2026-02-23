import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'WAREHOUSE') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
