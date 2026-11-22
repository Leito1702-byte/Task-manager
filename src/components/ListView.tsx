// ============================================================
// ListView – tabla ordenable de tareas
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useUsers } from '../hooks/useUsers';
import type { Tarea, Estado } from '../types';
import { ESTADO_LABELS } from '../types';

type SortKey = 'nombre' | 'estado' | 'story_points' | 'fecha_entrega' | 'asignado';

interface ListViewProps {
  tareas: Tarea[];
  onNuevaTarea: () => void;
}

function comparar(a: Tarea, b: Tarea, key: SortKey, asc: boolean, resolveNombre: (id: string) => string): number {
  let va: string | number = '';
  let vb: string | number = '';

  switch (key) {
    case 'nombre':       va = a.nombre.toLowerCase(); vb = b.nombre.toLowerCase(); break;
    case 'estado':       va = ESTADO_LABELS[a.estado as Estado]; vb = ESTADO_LABELS[b.estado as Estado]; break;
    case 'story_points': va = a.story_points ?? -1;   vb = b.story_points ?? -1;  break;
    case 'fecha_entrega':va = a.fecha_entrega ?? '';   vb = b.fecha_entrega ?? ''; break;
    case 'asignado':     va = resolveNombre(a.id_asignado).toLowerCase(); vb = resolveNombre(b.id_asignado).toLowerCase(); break;
  }

  if (va < vb) return asc ? -1 : 1;
  if (va > vb) return asc ? 1  : -1;
  return 0;
}

function renderArrow(sortKey: SortKey, col: SortKey, asc: boolean) {
  if (sortKey !== col) return null;
  return <span className="ml-1">{asc ? '↑' : '↓'}</span>;
}

export function ListView({ tareas, onNuevaTarea }: ListViewProps) {
  const { resolveNombre, resolveIniciales } = useUsers();
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [asc, setAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setAsc(v => !v);
    else { setSortKey(key); setAsc(true); }
  };

  const sorted = [...tareas].sort((a, b) => comparar(a, b, sortKey, asc, resolveNombre));

  const thClass = 'text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none hover:opacity-80 transition-opacity';
  const thStyle = { color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {tareas.length} {tareas.length === 1 ? 'tarea' : 'tareas'}
        </h2>
        <button
          onClick={onNuevaTarea}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-150"
        >
          + Nueva tarea
        </button>
      </div>

      {tareas.length === 0 ? (
        <EmptyState
          title="Sin tareas"
          description="Aún no hay tareas. ¡Crea la primera!"
          action={{ label: '+ Nueva tarea', onClick: onNuevaTarea }}
        />
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm border-collapse">
            <thead style={{ background: 'var(--color-surface-2)' }}>
              <tr>
                <th className={thClass} style={thStyle} onClick={() => handleSort('nombre')}>
                  Nombre {renderArrow(sortKey, 'nombre', asc)}
                </th>
                <th className={thClass} style={thStyle} onClick={() => handleSort('estado')}>
                  Estado {renderArrow(sortKey, 'estado', asc)}
                </th>
                <th className={thClass} style={thStyle} onClick={() => handleSort('story_points')}>
                  SP {renderArrow(sortKey, 'story_points', asc)}
                </th>
                <th className={thClass} style={thStyle} onClick={() => handleSort('fecha_entrega')}>
                  Entrega {renderArrow(sortKey, 'fecha_entrega', asc)}
                </th>
                <th className={thClass} style={thStyle} onClick={() => handleSort('asignado')}>
                  Asignado {renderArrow(sortKey, 'asignado', asc)}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr
                  key={t.id_tarea}
                  className="transition-colors duration-100 hover:opacity-90"
                  style={{
                    background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                    borderTop: `1px solid var(--color-border)`,
                  }}
                >
                  <td className="px-4 py-3 font-medium max-w-[260px]">
                    <Link
                      to={`/tareas/${t.id_tarea}`}
                      className="hover:underline line-clamp-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {t.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge estado={t.estado as Estado} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t.story_points ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t.fecha_entrega
                      ? new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(t.fecha_entrega))
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar iniciales={resolveIniciales(t.id_asignado)} nombre={resolveNombre(t.id_asignado)} size="sm" />
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {resolveNombre(t.id_asignado)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
