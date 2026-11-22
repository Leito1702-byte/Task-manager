// ============================================================
// ErrorState – estado de error con botón de reintento
// ============================================================
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Ocurrió un error', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-4xl mb-3 select-none">⚠️</div>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-150"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
