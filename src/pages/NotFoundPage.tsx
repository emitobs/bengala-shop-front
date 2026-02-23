import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-5xl sm:text-6xl font-bold text-primary">404</h1>
      <p className="text-lg sm:text-xl text-secondary-light">Pagina no encontrada</p>
      <Link
        to="/"
        className="mt-4 rounded-button bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
