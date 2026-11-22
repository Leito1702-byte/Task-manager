// ============================================================
// Página de Registro de Nuevos Usuarios
// ============================================================
import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast, formatNestError } from '../hooks/useToast';

export function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones en cliente
    if (!nombre.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio');
      return;
    }
    if (!contrasena) {
      setError('La contraseña es obligatoria');
      return;
    }
    if (contrasena.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(nombre.trim(), email.trim(), contrasena);
      addToast('¡Cuenta creada e inicio de sesión exitoso!', 'success');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(formatNestError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-indigo-400';
  const inputStyle = {
    background: 'var(--color-surface-2)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  };
  const labelClass = 'block text-sm font-medium mb-1.5';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo / Título */}
        <div className="mb-6 text-center">
          <div className="text-3xl mb-2 select-none">✨</div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Crear cuenta
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Regístrate en Task Manager
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="reg-nombre" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Nombre completo
            </label>
            <input
              id="reg-nombre"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Leonardo Mata"
              className={inputClass}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={inputClass}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="reg-password" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className={inputClass}
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="reg-confirm" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Repite tu contraseña"
              className={inputClass}
              style={inputStyle}
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
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 mt-2 cursor-pointer shadow-xs"
          >
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        {/* Enlace a login */}
        <div className="mt-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
