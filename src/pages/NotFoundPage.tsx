// ============================================================
// Página 404 – ruta no encontrada
// ============================================================
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="text-6xl mb-4 select-none">🔍</div>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
        Página no encontrada
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-150"
      >
        Volver al tablero
      </Link>
    </div>
  );
}
