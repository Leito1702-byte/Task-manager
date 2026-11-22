// ============================================================
// Página de Login
// ============================================================
import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { formatNestError } from '../hooks/useToast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica en cliente
    if (!email.trim()) { setError('El correo es obligatorio'); return; }
    if (!contrasena) { setError('La contraseña es obligatoria'); return; }

    setLoading(true);
    try {
      await login(email.trim(), contrasena);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError('Credenciales inválidas');
      } else {
        setError(formatNestError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo / título */}
        <div className="mb-8 text-center">
          <div className="text-3xl mb-2 select-none">📋</div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Task Manager
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-indigo-400"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="contrasena"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-indigo-400"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-red-500 font-medium">
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 mt-2"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Enlace a Registro */}
        <div className="mt-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
