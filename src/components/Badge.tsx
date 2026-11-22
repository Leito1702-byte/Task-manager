// ============================================================
// Badge de estado con color consistente
// ============================================================
import type { Estado } from '../types';
import { ESTADO_LABELS, ESTADO_COLORS } from '../types';

interface BadgeProps {
  estado: Estado;
  size?: 'sm' | 'md';
}

export function Badge({ estado, size = 'md' }: BadgeProps) {
  const color = ESTADO_COLORS[estado];
  const label = ESTADO_LABELS[estado];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${padding}`}
      style={{
        backgroundColor: color + '22', // 13% opacidad
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  );
}
