import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Truck,
  Image,
  Tag,
  Users,
  Settings,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Bell,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import TigerLogo from '@/assets/ico.png';
import { cn } from '@/lib/cn';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // If undefined, all staff roles can see it
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/productos', label: 'Productos', icon: Package, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/categorias', label: 'Categorías', icon: FolderTree, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/envios', label: 'Envíos', icon: Truck, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/banners', label: 'Banners', icon: Image, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/cupones', label: 'Cupones', icon: Tag, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin/sucursales', label: 'Sucursales', icon: Store, roles: ['SUPER_ADMIN'] },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN', 'SUPER_ADMIN'] },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/iniciar-sesion');
  };

  const userRole = user?.role ?? 'CUSTOMER';
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );
  const defaultRoute = userRole === 'WAREHOUSE' ? '/admin/pedidos' : '/admin';

  const sidebarContent = (
    <>
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link
          to={defaultRoute}
          onClick={handleNavClick}
          className="flex items-center gap-2"
        >
          <img src={TigerLogo} alt="" className="h-8 w-auto" />
          <span className="text-lg font-extrabold tracking-tight text-primary">
            BENGALA
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            MAX
          </span>
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {userRole === 'WAREHOUSE' ? 'Almacen' : 'Admin'}
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-button text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-white/10 p-3">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Volver a la tienda
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden',
          isSidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - fixed on desktop, slide-in on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-secondary transition-transform duration-300 ease-in-out lg:z-auto lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content area with left margin for fixed sidebar on desktop */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-button text-secondary-light transition-colors hover:bg-gray-100 hover:text-primary lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-secondary">
              Panel de Administración
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications placeholder */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-button text-secondary-light transition-colors hover:bg-gray-100 hover:text-primary"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* Admin user info */}
            <div className="hidden items-center gap-3 border-l border-border pl-4 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
                {user?.firstName?.charAt(0) ?? 'A'}
                {user?.lastName?.charAt(0) ?? ''}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-secondary">
                  {user ? `${user.firstName} ${user.lastName}` : 'Administrador'}
                </p>
                <p className="text-xs text-secondary-light">
                  {user?.role === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : user?.role === 'WAREHOUSE'
                      ? 'Almacen'
                      : 'Admin'}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-button text-secondary-light transition-colors hover:bg-gray-100 hover:text-error"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-background p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
