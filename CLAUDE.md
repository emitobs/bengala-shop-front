# Bengala Max Web - React Frontend

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (design tokens in CSS variables)
- Zustand (state management)
- TanStack Query v5 (server state / data fetching)
- React Hook Form + Zod (forms)
- React Router v7 (routing)
- Axios (HTTP client)
- Lucide React (icons)
- Sonner (toast notifications)

## Component Patterns

### File Structure
```
components/
  ui/          # Base design system (Button, Input, Card, Modal, etc.)
  layout/      # Header, Footer, MobileNav, AdminLayout
  product/     # ProductCard, ProductGrid, Filters
  cart/        # CartDrawer, CartItem, CartSummary
  checkout/    # CheckoutForm steps
  auth/        # LoginForm, RegisterForm
  home/        # HeroBanner, FeaturedProducts
  admin/       # Admin-specific components
```

### Conventions
- One component per file, named same as file (PascalCase)
- Props interface named `{ComponentName}Props`
- Use `cn()` helper (clsx + tailwind-merge) for conditional classes
- Prefer composition over prop drilling

## State Management
- **Zustand stores** (`stores/`): auth, cart, ui state
- **TanStack Query** (`hooks/`): all server data (products, orders, etc.)
- Query keys: `['products']`, `['products', id]`, `['orders', { status }]`

## Routing
- Spanish URLs: `/productos`, `/carrito`, `/iniciar-sesion`, `/mi-cuenta`
- `ProtectedRoute` wrapper for auth-required pages
- `AdminRoute` wrapper for admin pages (`/admin/*`)

## Styling
- Tailwind utility classes (no CSS modules)
- Design tokens via CSS variables in `index.css`
- Mobile-first responsive: `sm:`, `md:`, `lg:`, `xl:`
- Border radius: 12px cards, 8px buttons, 6px inputs

## UI Text
- ALL user-visible text MUST be in Spanish
- Currency: UYU formatted with `formatUYU()` helper
- Dates: `es-UY` locale

## Commands
```bash
npm run dev     # Start dev server (port 5173)
npm run build   # Build for production
npm run preview # Preview production build
```
