// ============================================================
// Modal – Crear Tarea
// ============================================================
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { tasksApi } from '../api/tasks';
import { useToast, formatNestError } from '../hooks/useToast';
import { useUsers } from '../hooks/useUsers';
import type { Tarea } from '../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: (tarea: Tarea) => void;
}

export function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { users } = useUsers();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [idAsignado, setIdAsignado] = useState(currentUser?.sub ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (storyPoints !== '' && (isNaN(Number(storyPoints)) || Number(storyPoints) < 0))
      e.storyPoints = 'Los story points deben ser un número ≥ 0';
    if (!idAsignado) e.idAsignado = 'Debes asignar la tarea a un usuario';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const tarea = await tasksApi.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        story_points: storyPoints !== '' ? Number(storyPoints) : undefined,
        fecha_entrega: fechaEntrega || undefined,
        id_asignado: idAsignado,
      });
      onCreated(tarea);
      addToast('Tarea creada correctamente', 'success');
      onClose();
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-indigo-400';
  const inputStyle = {
    background: 'var(--color-surface-2)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  };
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-xl border overflow-y-auto max-h-[90vh]"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="create-task-title" className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Nueva tarea
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-xl opacity-60 hover:opacity-100" style={{ color: 'var(--color-text)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="ct-nombre" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input id="ct-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={inputClass} style={inputStyle} disabled={loading} />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="ct-desc" className={labelClass} style={{ color: 'var(--color-text)' }}>Descripción</label>
            <textarea id="ct-desc" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className={inputClass} style={inputStyle} disabled={loading} />
          </div>

          {/* Story Points */}
          <div>
            <label htmlFor="ct-sp" className={labelClass} style={{ color: 'var(--color-text)' }}>Story Points</label>
            <input id="ct-sp" type="number" min={0} step={1} value={storyPoints} onChange={e => setStoryPoints(e.target.value)} className={inputClass} style={inputStyle} disabled={loading} placeholder="0" />
            {errors.storyPoints && <p className="text-xs text-red-500 mt-1">{errors.storyPoints}</p>}
          </div>

          {/* Fecha de entrega */}
          <div>
            <label htmlFor="ct-fecha" className={labelClass} style={{ color: 'var(--color-text)' }}>Fecha de entrega</label>
            <input id="ct-fecha" type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} className={inputClass} style={inputStyle} disabled={loading} />
          </div>

          {/* Asignado */}
          <div>
            <label htmlFor="ct-asignado" className={labelClass} style={{ color: 'var(--color-text)' }}>
              Asignado a <span className="text-red-500">*</span>
            </label>
            <select id="ct-asignado" value={idAsignado} onChange={e => setIdAsignado(e.target.value)} className={inputClass} style={inputStyle} disabled={loading}>
              <option value="">— Selecciona un usuario —</option>
              {users.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
              ))}
            </select>
            {errors.idAsignado && <p className="text-xs text-red-500 mt-1">{errors.idAsignado}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 transition-colors duration-150">
              {loading ? 'Creando…' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
