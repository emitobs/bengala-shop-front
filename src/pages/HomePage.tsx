import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useBanners } from '@/hooks/useBanners';
import { useSubscribeNewsletter } from '@/hooks/useNewsletter';
import { normalizeProducts } from '@/lib/product-helpers';
import type { Banner } from '@/types';

// ===========================================================================
// HomePage Component
// ===========================================================================

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroCarousel />
      <SecondaryBannersGrid />
      <FeaturedProductsSection />
      <NewArrivalsSection />
      <NewsletterSection />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1 : Hero Carousel
// ---------------------------------------------------------------------------

function HeroCarousel() {
  const { data: banners } = useBanners();
  const heroBanners = (banners ?? []).filter(
    (b) => b.position === 'hero' || b.position === 'home' || b.position === 'HOME_HERO',
  );

  if (heroBanners.length === 0) {
    return <HeroFallback />;
  }

  if (heroBanners.length === 1) {
    return <HeroSlide banner={heroBanners[0]} />;
  }

  return <HeroSlider banners={heroBanners} />;
}

// Shared decorative background for all hero variants
function HeroBackground() {
  return (
    <>
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-animated"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #FF6B35 0%, #E5541E 33%, #2D2D3F 66%, #FF6B35 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Floating decorative blobs */}
      <div className="absolute top-10 right-[10%] w-72 h-72 bg-white/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-5 left-[5%] w-56 h-56 bg-white/10 rounded-full blur-lg animate-float-slow" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" />

      {/* Small decorative shapes */}
      <div className="absolute top-20 left-[15%] w-4 h-4 bg-white rounded-full opacity-40 animate-float" />
      <div className="absolute bottom-28 right-[20%] w-3 h-3 bg-white rounded-full opacity-30 animate-float-slow" />
      <div className="absolute top-[40%] right-[8%] w-5 h-5 bg-white/30 rounded-full animate-float-slow" />
    </>
  );
}

function HeroFallback() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-md mb-6">
            Variedad que sorprende
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Bienvenido a{' '}
            <span className="underline decoration-accent decoration-4 underline-offset-4">
              Bengala Max
            </span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed max-w-lg font-medium">
            Encontra los mejores productos al mejor precio. Envio a todo
            Uruguay.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/productos">
              <Button variant="primary" size="lg" className="bg-white text-secondary hover:bg-gray-100 shadow-lg rounded-full font-bold px-8">
                Ver Productos
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/productos?ofertas=true">
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/15 hover:text-white rounded-full px-8"
              >
                Ver Ofertas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSlide({ banner }: { banner: Banner }) {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      {/* Banner image layered on top with blend */}
      <img
        src={banner.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36">
        <div className="max-w-2xl">
          {banner.subtitle && (
            <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-md mb-6">
              {banner.subtitle}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {banner.title}
          </h1>
          {banner.linkUrl && (
            <div className="mt-8">
              <Link to={banner.linkUrl}>
                <Button variant="primary" size="lg" className="bg-white text-secondary hover:bg-gray-100 shadow-lg rounded-full font-bold px-8">
                  Ver mas
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % banners.length) + banners.length) % banners.length);
    },
    [banners.length],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 5s
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, banners.length]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <HeroBackground />

      {/* Slides */}
      <div className="relative h-[400px] sm:h-[480px] lg:h-[560px]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            {/* Banner image blended on top of gradient */}
            <img
              src={banner.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
            />

            <div className="relative flex h-full items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  {banner.subtitle && (
                    <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-md mb-5">
                      {banner.subtitle}
                    </span>
                  )}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                    {banner.title}
                  </h2>
                  {banner.linkUrl && (
                    <div className="mt-6">
                      <Link to={banner.linkUrl}>
                        <Button variant="primary" size="lg" className="bg-white text-secondary hover:bg-gray-100 shadow-lg rounded-full font-bold px-8">
                          Ver mas
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2 : Secondary Banners Grid
// ---------------------------------------------------------------------------

function SecondaryBannersGrid() {
  const { data: banners } = useBanners();
  const secondaryBanners = (banners ?? []).filter(
    (b) => b.position === 'secondary' || b.position === 'HOME_SECONDARY',
  );

  if (secondaryBanners.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-5 ${
            secondaryBanners.length === 1
              ? 'grid-cols-1'
              : secondaryBanners.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {secondaryBanners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.linkUrl ?? '/productos'}
              className="group relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="aspect-[5/2]">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1 text-sm text-white/80 drop-shadow">
                    {banner.subtitle}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white/90 transition-colors group-hover:text-white">
                  Ver mas
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 3 : Featured Products
// ---------------------------------------------------------------------------

function SectionTitle({
  title,
  subtitle,
  linkTo,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-secondary">
          {title}
        </h2>
        <p className="mt-1 text-gray-500">{subtitle}</p>
        {/* Decorative accent */}
        <div className="flex gap-1.5 mt-3">
          <div className="h-1.5 w-6 rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        </div>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group/link"
        >
          {linkLabel ?? 'Ver todos'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function FeaturedProductsSection() {
  const { data: featuredData, isLoading, error } = useProducts({
    isFeatured: true,
    limit: 8,
  });

  const products = featuredData ? normalizeProducts(featuredData.data) : [];

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Productos Destacados"
          subtitle="Lo mas vendido de la semana"
          linkTo="/productos?destacados=true"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton variant="text" className="w-16" />
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">No se pudieron cargar los productos destacados</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/productos?destacados=true">
            <Button variant="outline" size="md" className="rounded-full">
              Ver todos los productos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 5 : New Arrivals
// ---------------------------------------------------------------------------

function NewArrivalsSection() {
  const { data: newData, isLoading, error } = useProducts({
    limit: 4,
    sortBy: 'newest',
  });

  const products = newData ? normalizeProducts(newData.data) : [];

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Novedades"
          subtitle="Los ultimos productos que llegaron"
          linkTo="/productos?orden=recientes"
          linkLabel="Ver todos"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton variant="text" className="w-16" />
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">No se pudieron cargar las novedades</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/productos?orden=recientes">
            <Button variant="outline" size="md" className="rounded-full">
              Ver todas las novedades
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 6 : Newsletter
// ---------------------------------------------------------------------------

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const subscribe = useSubscribeNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribe.mutate({ email: email.trim() }, {
        onSuccess: () => setEmail(''),
      });
    }
  };

  return (
    <section
      className="py-16 sm:py-20"
      style={{
        background: 'linear-gradient(135deg, #2D2D3F 0%, #1a1a2e 60%, #2D2D3F 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center mb-5">
            <div
              className="flex items-center justify-center h-14 w-14 rounded-full shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #E5541E)',
              }}
            >
              <Send className="h-7 w-7 text-white" strokeWidth={1.8} />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Suscribite a nuestro newsletter
          </h2>
          <p className="mt-3 text-gray-400 text-base sm:text-lg">
            Recibi ofertas exclusivas y novedades directo en tu correo
          </p>

          {subscribe.isSuccess ? (
            <div className="mt-8 rounded-2xl bg-success/10 border border-success/30 p-5">
              <p className="text-success font-semibold text-lg">
                Gracias por suscribirte!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Pronto recibiras nuestras mejores ofertas.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electronico"
                className="flex-1 rounded-full bg-white/10 border border-white/20 px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors"
              />
              <Button
                variant="primary"
                size="md"
                className="rounded-full whitespace-nowrap px-6"
                isLoading={subscribe.isPending}
              >
                Suscribirme
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
