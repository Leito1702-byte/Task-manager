// ============================================================
// TaskCard – tarjeta Kanban con DnD y menú "Mover a…"
// ============================================================
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { CategoryChip } from './CategoryChip';
import { Skeleton } from './Skeleton';
import { ESTADOS, ESTADO_LABELS } from '../types';
import type { Tarea, TareaDetalle, Estado } from '../types';
import { useUsers } from '../hooks/useUsers';

interface TaskCardProps {
  tarea: Tarea;
  detalle?: TareaDetalle;      // cargado en segundo plano
  loadingDetalle?: boolean;
  onMoverA: (estado: Estado) => void;
}

function isFechaVencida(fecha?: string, estado?: Estado): boolean {
  if (!fecha || estado === 'COMPLETADO') return false;
  return new Date(fecha) < new Date();
}

function formatFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' }).format(new Date(fecha));
}

export function TaskCard({ tarea, detalle, loadingDetalle, onMoverA }: TaskCardProps) {
  const { resolveIniciales, resolveNombre } = useUsers();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tarea.id_tarea, data: { estado: tarea.estado } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const vencida = isFechaVencida(tarea.fecha_entrega, tarea.estado);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      className="rounded-xl border p-3.5 shadow-sm hover:shadow-md transition-shadow duration-150 select-none group"
    >
      {/* Handle de arrastre + nombre */}
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          aria-label="Arrastrar tarea"
          className="mt-0.5 cursor-grab text-slate-300 hover:text-slate-400 shrink-0 touch-none"
        >
          ⠿
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/tareas/${tarea.id_tarea}`}
            className="text-sm font-medium leading-snug hover:underline line-clamp-2 block"
            style={{ color: 'var(--color-text)' }}
          >
            {tarea.nombre}
          </Link>
        </div>
        {/* Story points badge */}
        {tarea.story_points != null && (
          <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {tarea.story_points} SP
          </span>
        )}
      </div>

      {/* Fecha de entrega */}
      {tarea.fecha_entrega && (
        <div className={`text-xs mt-2 ml-5 font-medium ${vencida ? 'text-red-500' : ''}`} style={!vencida ? { color: 'var(--color-text-muted)' } : {}}>
          📅 {formatFecha(tarea.fecha_entrega)}{vencida && ' · Vencida'}
        </div>
      )}

      {/* Categorías */}
      <div className="mt-2 ml-5 flex flex-wrap gap-1 min-h-[20px]">
        {loadingDetalle ? (
          <Skeleton className="h-4 w-16 rounded-full" />
        ) : (
          detalle?.categorias.map(cat => (
            <CategoryChip key={cat.id_categoria} categoria={cat} size="sm" />
          ))
        )}
      </div>

      {/* Footer: avatar + menú Mover a */}
      <div className="mt-3 ml-5 flex items-center justify-between gap-2">
        <Avatar
          iniciales={resolveIniciales(tarea.id_asignado)}
          nombre={resolveNombre(tarea.id_asignado)}
          size="sm"
        />

        {/* Menú accesible "Mover a…" */}
        <select
          aria-label="Mover tarea a otro estado"
          value={tarea.estado}
          onChange={e => onMoverA(e.target.value as Estado)}
          className="text-xs rounded-md border px-1.5 py-0.5 cursor-pointer transition-colors duration-150 outline-none focus:ring-2 focus:ring-indigo-400"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {ESTADOS.map(e => (
            <option key={e} value={e} disabled={e === tarea.estado}>
              {e === tarea.estado ? '→ Mover a…' : ESTADO_LABELS[e]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
