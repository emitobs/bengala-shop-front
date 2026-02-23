import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
} from 'lucide-react';
import TigerLogo from '@/assets/ico.png';

const ACCOUNT_LINKS = [
  { to: '/mi-cuenta', label: 'Mi Perfil' },
  { to: '/mi-cuenta/pedidos', label: 'Mis Pedidos' },
  { to: '/favoritos', label: 'Favoritos' },
  { to: '/carrito', label: 'Carrito' },
] as const;

const LEGAL_LINKS = [
  { to: '/terminos-y-condiciones', label: 'Terminos y Condiciones' },
  { to: '/politica-de-privacidad', label: 'Privacidad' },
  { to: '/politica-de-devoluciones', label: 'Devoluciones' },
  { to: '/preguntas-frecuentes', label: 'FAQ' },
] as const;

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #2D2D3F 0%, #1a1a2e 100%)',
      }}
      className="text-white"
    >
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={TigerLogo} alt="" className="h-9 w-auto" />
              <span className="text-xl font-black tracking-tight text-white">
                BENGALA <span className="text-primary">MAX</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Tu bazar online en Uruguay. Encontra los mejores productos con envio a todo el pais.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.instagram.com/bengala_max/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
                }}
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-white" />
              </a>
              <a
                href="https://www.facebook.com/BengalaMax/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Informacion
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Mi Cuenta
            </h3>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Nuestros Locales
            </h3>
            <div className="mt-4 space-y-4">
              {/* Fray Bentos */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                  Fray Bentos
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="text-sm text-gray-400">Rincon 1783</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <a href="tel:+59898161513" className="text-sm text-gray-400 transition-colors hover:text-white">098 161 513</a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="text-sm text-gray-400">18 de Julio 1174</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <a href="tel:+59891423838" className="text-sm text-gray-400 transition-colors hover:text-white">091 423 838</a>
                  </li>
                </ul>
              </div>
              {/* Mercedes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                  Mercedes
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="text-sm text-gray-400">Colon 442</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <a href="tel:+59891423854" className="text-sm text-gray-400 transition-colors hover:text-white">091 423 854</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; 2026 Bengala Max. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Metodos de pago:</span>
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5"
                title="Tarjeta de credito"
              >
                <CreditCard className="h-4 w-4 text-primary/70" />
              </div>
              <div
                className="flex h-7 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5"
                title="Transferencia bancaria"
              >
                <Banknote className="h-4 w-4 text-primary/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
