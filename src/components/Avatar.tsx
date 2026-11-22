// ============================================================
// Avatar con iniciales – muestra iniciales del usuario asignado
// ============================================================
interface AvatarProps {
  iniciales: string;
  nombre?: string;
  size?: 'sm' | 'md';
}

const COLORS = [
  '#4f46e5','#0891b2','#059669','#d97706','#dc2626',
  '#7c3aed','#db2777','#0284c7','#16a34a','#ca8a04',
];

function colorForString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ iniciales, nombre, size = 'sm' }: AvatarProps) {
  const bg = colorForString(iniciales);
  const dim = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-sm';

  return (
    <span
      className={`${dim} inline-flex items-center justify-center rounded-full font-semibold text-white select-none shrink-0`}
      style={{ backgroundColor: bg }}
      title={nombre}
      aria-label={nombre ?? iniciales}
    >
      {iniciales}
    </span>
  );
}
