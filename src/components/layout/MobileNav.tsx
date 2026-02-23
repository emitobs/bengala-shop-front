import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  ShoppingBag,
  Tag,
  UserCircle,
  Package,
  Heart,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import LogoHorizontal from '@/assets/LogoHorizontal.png';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/productos', label: 'Tienda', icon: ShoppingBag },
  { to: '/productos?ofertas=true', label: 'Ofertas', icon: Tag },
] as const;

const ACCOUNT_LINKS = [
  { to: '/mi-cuenta', label: 'Mi Cuenta', icon: UserCircle },
  { to: '/mi-cuenta/pedidos', label: 'Mis Pedidos', icon: Package },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
] as const;

export default function MobileNav() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = () => {
    closeMobileMenu();
  };

  const handleLogout = () => {
    clearAuth();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden',
          isMobileMenuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" onClick={handleNavClick} className="flex items-center">
            <img
              src={LogoHorizontal}
              alt="Bengala Max"
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={closeMobileMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full text-secondary-light transition-colors hover:bg-gray-100 hover:text-primary"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* User info section */}
          <div className="border-b border-border px-4 py-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-secondary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-secondary-light">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <Link
                to="/iniciar-sesion"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-button bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Navigation links */}
          <nav className="px-2 py-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-secondary-light">
              Navegación
            </p>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-secondary hover:bg-gray-50 hover:text-primary',
                    link.label === 'Ofertas' && !isActive && 'text-primary font-semibold',
                  )
                }
              >
                <link.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Separator */}
          <div className="mx-4 border-t border-border" />

          {/* Account links */}
          <nav className="px-2 py-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-secondary-light">
              Mi Cuenta
            </p>
            {ACCOUNT_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-secondary hover:bg-gray-50 hover:text-primary',
                  )
                }
              >
                <link.icon className="h-[18px] w-[18px]" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        {user && (
          <div
            className="border-t border-border p-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-button border border-error/20 px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
