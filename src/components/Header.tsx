// ============================================================
// Header – cabecera global con badge de Administrador
// ============================================================
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  viewMode?: 'kanban' | 'list';
  onToggleView?: () => void;
}

export function Header({ darkMode, onToggleDark, viewMode, onToggleView }: HeaderProps) {
  const { currentUser } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Nombre de la app */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base tracking-tight select-none" style={{ color: 'var(--color-text)' }}>
          Task Manager
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
          Modo Demo / Admin
        </span>
      </div>

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

      {/* Usuario actual / Rol Administrador */}
      {currentUser && (
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Leonardo Mata
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            (Admin)
          </span>
        </div>
      )}
    </header>
  );
}
