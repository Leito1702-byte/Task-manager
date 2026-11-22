// ============================================================
// CategoryChip – chip de categoría con color y contraste auto
// ============================================================
import type { Categoria } from '../types';

interface CategoryChipProps {
  categoria: Categoria;
  onRemove?: () => void;
  onEdit?: () => void;
  size?: 'sm' | 'md';
}

// Calcula si el texto debe ser blanco o negro sobre el color de fondo
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Luminancia relativa (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function CategoryChip({ categoria, onRemove, onEdit, size = 'sm' }: CategoryChipProps) {
  const textColor = getContrastColor(categoria.color);
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: categoria.color, color: textColor }}
      title={categoria.descripcion}
    >
      {categoria.nombre}
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label={`Editar categoría ${categoria.nombre}`}
          className="opacity-70 hover:opacity-100 ml-0.5"
          style={{ color: textColor }}
        >
          ✎
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Eliminar categoría ${categoria.nombre}`}
          className="opacity-70 hover:opacity-100"
          style={{ color: textColor }}
        >
          ×
        </button>
      )}
    </span>
  );
}
