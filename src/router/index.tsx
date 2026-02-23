import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/router/ProtectedRoute';
import AdminRoute from '@/router/AdminRoute';
import Spinner from '@/components/ui/Spinner';

// Lazy-loaded pages for code-splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('@/pages/PaymentFailurePage'));
const PaymentPendingPage = lazy(() => import('@/pages/PaymentPendingPage'));
const PaymentSimulationPage = lazy(() => import('@/pages/PaymentSimulationPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductEditPage = lazy(() => import('@/pages/admin/AdminProductEditPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminShippingPage = lazy(() => import('@/pages/admin/AdminShippingPage'));
const AdminBannersPage = lazy(() => import('@/pages/admin/AdminBannersPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminBranchesPage = lazy(() => import('@/pages/admin/AdminBranchesPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <SuspensePage><HomePage /></SuspensePage> },
      { path: '/productos', element: <SuspensePage><ProductListPage /></SuspensePage> },
      { path: '/productos/:slug', element: <SuspensePage><ProductDetailPage /></SuspensePage> },
      { path: '/categorias/:slug', element: <SuspensePage><CategoryPage /></SuspensePage> },
      { path: '/buscar', element: <SuspensePage><SearchResultsPage /></SuspensePage> },
      { path: '/carrito', element: <SuspensePage><CartPage /></SuspensePage> },
      { path: '/iniciar-sesion', element: <SuspensePage><LoginPage /></SuspensePage> },
      { path: '/registrarse', element: <SuspensePage><RegisterPage /></SuspensePage> },
      { path: '/recuperar-contraseña', element: <SuspensePage><ForgotPasswordPage /></SuspensePage> },
      { path: '/terminos-y-condiciones', element: <SuspensePage><TermsPage /></SuspensePage> },
      { path: '/politica-de-privacidad', element: <SuspensePage><PrivacyPage /></SuspensePage> },
      { path: '/politica-de-devoluciones', element: <SuspensePage><ReturnsPage /></SuspensePage> },
      { path: '/preguntas-frecuentes', element: <SuspensePage><FaqPage /></SuspensePage> },
      { path: '/pago/exito', element: <SuspensePage><PaymentSuccessPage /></SuspensePage> },
      { path: '/pago/error', element: <SuspensePage><PaymentFailurePage /></SuspensePage> },
      { path: '/pago/pendiente', element: <SuspensePage><PaymentPendingPage /></SuspensePage> },
      { path: '/pago/simulacion', element: <SuspensePage><PaymentSimulationPage /></SuspensePage> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout', element: <SuspensePage><CheckoutPage /></SuspensePage> },
          { path: '/mi-cuenta', element: <SuspensePage><ProfilePage /></SuspensePage> },
          { path: '/mi-cuenta/pedidos', element: <SuspensePage><OrdersPage /></SuspensePage> },
          { path: '/mi-cuenta/pedidos/:id', element: <SuspensePage><OrderDetailPage /></SuspensePage> },
          { path: '/favoritos', element: <SuspensePage><FavoritesPage /></SuspensePage> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <SuspensePage><AdminDashboardPage /></SuspensePage> },
          { path: '/admin/productos', element: <SuspensePage><AdminProductsPage /></SuspensePage> },
          { path: '/admin/productos/nuevo', element: <SuspensePage><AdminProductEditPage /></SuspensePage> },
          { path: '/admin/productos/:id', element: <SuspensePage><AdminProductEditPage /></SuspensePage> },
          { path: '/admin/categorias', element: <SuspensePage><AdminCategoriesPage /></SuspensePage> },
          { path: '/admin/pedidos', element: <SuspensePage><AdminOrdersPage /></SuspensePage> },
          { path: '/admin/pedidos/:id', element: <SuspensePage><AdminOrderDetailPage /></SuspensePage> },
          { path: '/admin/envios', element: <SuspensePage><AdminShippingPage /></SuspensePage> },
          { path: '/admin/banners', element: <SuspensePage><AdminBannersPage /></SuspensePage> },
          { path: '/admin/cupones', element: <SuspensePage><AdminCouponsPage /></SuspensePage> },
          { path: '/admin/usuarios', element: <SuspensePage><AdminUsersPage /></SuspensePage> },
          { path: '/admin/sucursales', element: <SuspensePage><AdminBranchesPage /></SuspensePage> },
          { path: '/admin/configuracion', element: <SuspensePage><AdminSettingsPage /></SuspensePage> },
        ],
      },
    ],
  },
  { path: '*', element: <SuspensePage><NotFoundPage /></SuspensePage> },
]);
