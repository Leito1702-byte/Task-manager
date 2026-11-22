// ============================================================
// Componente Toast – notificaciones con aria-live
// ============================================================
import { useToast } from '../hooks/useToast';

const VARIANT_STYLES = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-indigo-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-white shadow-lg text-sm max-w-sm transition-all duration-200 ${VARIANT_STYLES[toast.variant]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Cerrar notificación"
            className="opacity-80 hover:opacity-100 text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
