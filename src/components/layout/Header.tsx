import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  LogOut,
  Package,
  UserCircle,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import LogoHorizontal from '@/assets/LogoHorizontal.png';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/categorias/tecnologia', label: 'Tecnologia' },
  { to: '/categorias/hogar', label: 'Hogar' },
  { to: '/categorias/ropa-y-accesorios', label: 'Ropa' },
] as const;

export default function Header() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const { isSearchOpen, toggleSearch, toggleMobileMenu } = useUIStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Close user dropdown on outside click
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node) &&
      userButtonRef.current &&
      !userButtonRef.current.contains(event.target as Node)
    ) {
      setIsUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isSearchOpen) toggleSearch();
    }
  };

  const handleLogout = () => {
    clearAuth();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="w-full">
      {/* Colorful announcement bar */}
      <div
        className="hidden sm:block"
        style={{
          background: 'linear-gradient(90deg, #FF6B35, #E5541E, #2D2D3F)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-white">
          Envio gratis en compras mayores a $3.000
        </div>
      </div>

      {/* Main header */}
      <div
        className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src={LogoHorizontal}
              alt="Bengala Max"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop search bar - pill shaped */}
          <form
            onSubmit={handleSearch}
            className="relative mx-4 hidden max-w-lg flex-1 md:flex"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Que estas buscando?"
              className="h-10 w-full rounded-full border border-border bg-background pl-5 pr-10 text-sm text-secondary outline-none transition-all placeholder:text-secondary-light/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-dark hover:scale-105"
              aria-label="Buscar"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <button
              onClick={toggleSearch}
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-light transition-colors hover:bg-primary/10 hover:text-primary md:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Favorites — hidden on mobile, accessible via mobile nav */}
            <Link
              to="/favoritos"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-secondary-light transition-colors hover:bg-primary/10 hover:text-primary sm:flex"
              aria-label="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* User menu — hidden on mobile, accessible via mobile nav */}
            <div className="relative hidden sm:block">
              <button
                ref={userButtonRef}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className={cn(
                  'flex h-11 items-center gap-1 rounded-full px-2 text-secondary-light transition-colors hover:bg-primary/10 hover:text-primary',
                  isUserMenuOpen && 'bg-primary/10 text-primary',
                )}
                aria-label="Mi cuenta"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <User className="h-5 w-5" />
                <ChevronDown
                  className={cn(
                    'hidden h-3.5 w-3.5 transition-transform duration-200 sm:block',
                    isUserMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-border bg-white py-1 shadow-xl shadow-secondary/5"
                >
                  {user ? (
                    <>
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold text-secondary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-secondary-light">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/mi-cuenta"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <UserCircle className="h-4 w-4" />
                        Mi Cuenta
                      </Link>
                      <Link
                        to="/mi-cuenta/pedidos"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <Package className="h-4 w-4" />
                        Mis Pedidos
                      </Link>
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Panel Admin
                        </Link>
                      )}
                      <div className="border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesion
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/iniciar-sesion"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <User className="h-4 w-4" />
                        Iniciar Sesion
                      </Link>
                      <Link
                        to="/registrarse"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
                      >
                        <UserCircle className="h-4 w-4" />
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={toggleDrawer}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary-light transition-colors hover:bg-primary/10 hover:text-primary sm:h-11 sm:w-11"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white animate-bounce-soft">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-light transition-colors hover:bg-gray-100 hover:text-primary md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <div
          className={cn(
            'overflow-hidden border-t border-border transition-all duration-300 ease-in-out md:hidden',
            isSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Que estas buscando?"
              className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm text-secondary outline-none placeholder:text-secondary-light/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              autoFocus={isSearchOpen}
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Desktop navigation bar */}
        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-secondary hover:bg-gray-50 hover:text-primary',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/productos?ofertas=true"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10"
            >
              Ofertas
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                HOT
              </span>
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
