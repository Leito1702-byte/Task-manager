// ============================================================
// Header – cabecera global con toggle tema y cerrar sesión
// ============================================================
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  viewMode?: 'kanban' | 'list';
  onToggleView?: () => void;
}

export function Header({ darkMode, onToggleDark, viewMode, onToggleView }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast('Sesión cerrada correctamente', 'info');
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Nombre de la app */}
      <span className="font-semibold text-base tracking-tight select-none" style={{ color: 'var(--color-text)' }}>
        Task Manager
      </span>

      {/* Espacio flexible */}
      <div className="flex-1" />

      {/* Toggle vista (solo cuando onToggleView existe) */}
      {onToggleView && (
        <button
          onClick={onToggleView}
          aria-label={viewMode === 'kanban' ? 'Cambiar a vista de lista' : 'Cambiar a vista Kanban'}
          title={viewMode === 'kanban' ? 'Vista de lista' : 'Vista Kanban'}
          className="p-2 rounded-lg text-sm transition-colors duration-150 hover:bg-opacity-80"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
        >
          {viewMode === 'kanban' ? '☰' : '⊞'}
        </button>
      )}

      {/* Toggle claro/oscuro */}
      <button
        onClick={onToggleDark}
        aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        className="p-2 rounded-lg text-sm transition-colors duration-150"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Usuario actual */}
      {currentUser && (
        <span className="text-sm hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
          {currentUser.email}
        </span>
      )}

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Salir
      </button>
    </header>
  );
}
