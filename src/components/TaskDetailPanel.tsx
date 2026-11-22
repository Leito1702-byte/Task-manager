// ============================================================
// TaskDetailPanel – panel lateral / modal de detalle de tarea
// Edición inline, categorías y comentarios
// ============================================================
import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { categoriesApi } from '../api/categories';
import { commentsApi } from '../api/comments';
import { useToast, formatNestError } from '../hooks/useToast';
import { useUsers } from '../hooks/useUsers';
import { Badge } from './Badge';
import { CategoryChip } from './CategoryChip';
import { Avatar } from './Avatar';
import { Skeleton } from './Skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { ErrorState } from './ErrorState';
import { ESTADOS, ESTADO_LABELS } from '../types';
import type { TareaDetalle, Estado, Categoria, Comentario } from '../types';

interface TaskDetailPanelProps {
  tareaId: string;
  onClose: () => void;
  onUpdated: (tarea: TareaDetalle) => void;
}

// Tiempo relativo simple
function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export function TaskDetailPanel({ tareaId, onClose, onUpdated }: TaskDetailPanelProps) {
  const { addToast } = useToast();
  const { users, resolveNombre, resolveIniciales } = useUsers();
  const navigate = useNavigate();

  // ── Estado del detalle ──────────────────────────────────────
  const [tarea, setTarea] = useState<TareaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Estado de edición de campos ─────────────────────────────
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSP, setEditSP] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editAsignado, setEditAsignado] = useState('');
  const [editEstado, setEditEstado] = useState<Estado>('PENDIENTE');
  const [saving, setSaving] = useState(false);

  // ── Estado de categorías ───────────────────────────────────
  const [catAvailable, setCatAvailable] = useState<Categoria[]>([]);
  const [catToAdd, setCatToAdd] = useState('');
  const [newCatNombre, setNewCatNombre] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#4f46e5');
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [deletingCat, setDeletingCat] = useState<Categoria | null>(null);

  // ── Estado de comentarios ──────────────────────────────────
  const [comentario, setComentario] = useState('');
  const [savingComentario, setSavingComentario] = useState(false);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  // ── Carga del detalle ──────────────────────────────────────
  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tasksApi.getOne(tareaId);
      setTarea(data);
      setEditNombre(data.nombre);
      setEditDesc(data.descripcion ?? '');
      setEditSP(data.story_points != null ? String(data.story_points) : '');
      setEditFecha(data.fecha_entrega ? data.fecha_entrega.split('T')[0] : '');
      setEditAsignado(data.id_asignado);
      setEditEstado(data.estado);
      // Cargar disponibles
      const avail = await tasksApi.getAvailableCategories(data.id_tarea);
      setCatAvailable(avail as Categoria[]);
    } catch {
      setError('No se pudo cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  // ── Guardar solo los campos modificados ───────────────────
  const handleSave = async () => {
    if (!tarea) return;
    const diff: Record<string, unknown> = {};

    if (editNombre.trim() !== tarea.nombre) diff.nombre = editNombre.trim();
    if (editDesc !== (tarea.descripcion ?? '')) diff.descripcion = editDesc;
    const spNum = editSP !== '' ? Number(editSP) : undefined;
    if (spNum !== tarea.story_points) diff.story_points = spNum;
    const fechaISO = editFecha || undefined;
    const fechaActual = tarea.fecha_entrega ? tarea.fecha_entrega.split('T')[0] : undefined;
    if (fechaISO !== fechaActual) diff.fecha_entrega = fechaISO;
    if (editAsignado !== tarea.id_asignado) diff.id_asignado = editAsignado;
    if (editEstado !== tarea.estado) diff.estado = editEstado;

    if (Object.keys(diff).length === 0) {
      addToast('Sin cambios para guardar', 'info');
      return;
    }

    setSaving(true);
    try {
      const updated = await tasksApi.update(tarea.id_tarea, diff as Parameters<typeof tasksApi.update>[1]);
      const updatedDetalle: TareaDetalle = { ...tarea, ...updated };
      setTarea(updatedDetalle);
      onUpdated(updatedDetalle);
      addToast('Tarea actualizada', 'success');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Asociar categoría existente ───────────────────────────
  const handleAddExistingCat = async () => {
    if (!tarea || !catToAdd) return;
    setSavingCat(true);
    try {
      await tasksApi.addCategory(tarea.id_tarea, catToAdd);
      await cargar();
      setCatToAdd('');
      addToast('Categoría asociada', 'success');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  // ── Crear nueva categoría ─────────────────────────────────
  const handleCreateCat = async () => {
    if (!tarea || !newCatNombre.trim()) return;
    setSavingCat(true);
    try {
      await categoriesApi.create({
        id_tarea: tarea.id_tarea,
        nombre: newCatNombre.trim(),
        descripcion: newCatDesc.trim() || undefined,
        color: newCatColor,
      });
      await cargar();
      setNewCatNombre('');
      setNewCatDesc('');
      setNewCatColor('#4f46e5');
      setShowNewCatForm(false);
      addToast('Categoría creada', 'success');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  // ── Editar categoría ──────────────────────────────────────
  const handleEditCat = async () => {
    if (!editingCat) return;
    setSavingCat(true);
    try {
      await categoriesApi.update(editingCat.id_categoria, {
        nombre: editingCat.nombre,
        descripcion: editingCat.descripcion,
        color: editingCat.color,
      });
      await cargar();
      setEditingCat(null);
      addToast('Categoría actualizada', 'success');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  // ── Eliminar categoría ────────────────────────────────────
  const handleDeleteCat = async () => {
    if (!deletingCat) return;
    setSavingCat(true);
    try {
      await categoriesApi.delete(deletingCat.id_categoria);
      await cargar();
      setDeletingCat(null);
      addToast('Categoría eliminada de todas las tareas', 'info');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  // ── Enviar comentario ─────────────────────────────────────
  const handleComentario = async () => {
    if (!tarea || !comentario.trim()) return;
    setSavingComentario(true);
    try {
      const nuevo = await commentsApi.create(tarea.id_tarea, comentario.trim());
      setTarea(prev => prev ? {
        ...prev,
        comentarios: [...prev.comentarios, nuevo as Comentario],
      } : prev);
      setComentario('');
    } catch (err) {
      addToast(formatNestError(err), 'error');
    } finally {
      setSavingComentario(false);
    }
  };

  const handleKeyDownComentario = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      void handleComentario();
    }
  };

  // ── Estilos compartidos ───────────────────────────────────
  const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-150';
  const inputStyle = { background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  const labelClass = 'block text-xs font-medium mb-1 uppercase tracking-wide';

  return (
    <>
      {/* Panel lateral */}
      <div
        className="fixed inset-0 z-40 flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de tarea"
      >
        {/* Fondo */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Panel */}
        <div
          className="relative w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l flex flex-col"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Cabecera del panel */}
          <div
            className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 border-b"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => navigate('/')}
              aria-label="Cerrar panel"
              className="text-xl opacity-60 hover:opacity-100"
              style={{ color: 'var(--color-text)' }}
            >
              ←
            </button>
            <span className="text-sm font-semibold flex-1" style={{ color: 'var(--color-text)' }}>
              Detalle de tarea
            </span>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 transition-colors duration-150"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-5 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={cargar} />
            ) : tarea ? (
              <>
                {/* ── Campos editables ── */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Información
                  </h3>
                  <div className="space-y-3">
                    {/* Nombre */}
                    <div>
                      <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Nombre</label>
                      <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className={inputClass} style={inputStyle} />
                    </div>
                    {/* Descripción */}
                    <div>
                      <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Descripción</label>
                      <textarea rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} className={inputClass} style={inputStyle} />
                    </div>
                    {/* Story Points */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Story Points</label>
                        <input type="number" min={0} step={1} value={editSP} onChange={e => setEditSP(e.target.value)} className={inputClass} style={inputStyle} placeholder="0" />
                      </div>
                      {/* Fecha */}
                      <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Fecha de entrega</label>
                        <input type="date" value={editFecha} onChange={e => setEditFecha(e.target.value)} className={inputClass} style={inputStyle} />
                      </div>
                    </div>
                    {/* Estado */}
                    <div>
                      <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Estado</label>
                      <select value={editEstado} onChange={e => setEditEstado(e.target.value as Estado)} className={inputClass} style={inputStyle}>
                        {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
                      </select>
                      <div className="mt-1.5"><Badge estado={editEstado} /></div>
                    </div>
                    {/* Asignado */}
                    <div>
                      <label className={labelClass} style={{ color: 'var(--color-text-muted)' }}>Asignado a</label>
                      <select value={editAsignado} onChange={e => setEditAsignado(e.target.value)} className={inputClass} style={inputStyle}>
                        {users.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                {/* ── Categorías ── */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Categorías
                  </h3>
                  {/* Chips actuales */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tarea.categorias.length === 0 ? (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sin categorías</span>
                    ) : (
                      tarea.categorias.map(cat => (
                        <CategoryChip
                          key={cat.id_categoria}
                          categoria={cat}
                          size="md"
                          onEdit={() => setEditingCat({ ...cat })}
                          onRemove={() => setDeletingCat(cat)}
                        />
                      ))
                    )}
                  </div>

                  {/* Añadir existente */}
                  {catAvailable.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      <select
                        value={catToAdd}
                        onChange={e => setCatToAdd(e.target.value)}
                        className={`flex-1 ${inputClass}`}
                        style={inputStyle}
                      >
                        <option value="">Añadir categoría existente…</option>
                        {catAvailable.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                      </select>
                      <button
                        onClick={handleAddExistingCat}
                        disabled={!catToAdd || savingCat}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors duration-150"
                      >
                        Añadir
                      </button>
                    </div>
                  )}

                  {/* Toggle crear nueva */}
                  <button
                    onClick={() => setShowNewCatForm(v => !v)}
                    className="text-xs font-medium underline-offset-2 hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {showNewCatForm ? '− Cancelar nueva categoría' : '+ Crear nueva categoría'}
                  </button>

                  {showNewCatForm && (
                    <div className="mt-3 space-y-2 p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                      <input type="text" placeholder="Nombre*" value={newCatNombre} onChange={e => setNewCatNombre(e.target.value)} className={inputClass} style={inputStyle} />
                      <input type="text" placeholder="Descripción (opcional)" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className={inputClass} style={inputStyle} />
                      <div className="flex items-center gap-3">
                        <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Color</label>
                        <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer border" style={{ borderColor: 'var(--color-border)' }} />
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{newCatColor}</span>
                      </div>
                      <button
                        onClick={handleCreateCat}
                        disabled={!newCatNombre.trim() || savingCat}
                        className="w-full py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors duration-150"
                      >
                        {savingCat ? 'Creando…' : 'Crear categoría'}
                      </button>
                    </div>
                  )}
                </section>

                {/* ── Comentarios ── */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Comentarios
                  </h3>
                  <div className="space-y-3 mb-4">
                    {tarea.comentarios.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sin comentarios aún.</p>
                    ) : (
                      [...tarea.comentarios]
                        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                        .map(c => (
                          <div key={c.id_comentario} className="flex gap-3">
                            <Avatar iniciales={resolveIniciales(c.id_usuario)} nombre={resolveNombre(c.id_usuario)} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                                  {resolveNombre(c.id_usuario)}
                                </span>
                                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                  {tiempoRelativo(c.fecha)}
                                </span>
                              </div>
                              <p className="text-sm mt-0.5 whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                                {c.contenido}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Formulario de comentario */}
                  <div className="space-y-2">
                    <textarea
                      ref={comentarioRef}
                      rows={3}
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                      onKeyDown={handleKeyDownComentario}
                      placeholder="Escribe un comentario… (Ctrl+Enter para enviar)"
                      className={inputClass}
                      style={inputStyle}
                      disabled={savingComentario}
                    />
                    <button
                      onClick={handleComentario}
                      disabled={!comentario.trim() || savingComentario}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors duration-150"
                    >
                      {savingComentario ? 'Enviando…' : 'Comentar'}
                    </button>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Diálogo editar categoría */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingCat(null)} />
          <div className="relative w-full max-w-sm rounded-xl p-5 shadow-xl border space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Editar categoría</h2>
            <input type="text" value={editingCat.nombre} onChange={e => setEditingCat({ ...editingCat, nombre: e.target.value })} className={inputClass} style={inputStyle} placeholder="Nombre" />
            <input type="text" value={editingCat.descripcion ?? ''} onChange={e => setEditingCat({ ...editingCat, descripcion: e.target.value })} className={inputClass} style={inputStyle} placeholder="Descripción" />
            <div className="flex items-center gap-3">
              <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Color</label>
              <input type="color" value={editingCat.color} onChange={e => setEditingCat({ ...editingCat, color: e.target.value })} className="w-10 h-8 rounded cursor-pointer border" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditingCat(null)} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>Cancelar</button>
              <button onClick={handleEditCat} disabled={savingCat} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors duration-150">
                {savingCat ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo confirmar eliminación de categoría */}
      <ConfirmDialog
        open={!!deletingCat}
        dangerous
        title="Eliminar categoría"
        description={`¿Eliminar "${deletingCat?.nombre}"? Esta acción la quitará de TODAS las tareas que la tengan asociada. No se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteCat}
        onCancel={() => setDeletingCat(null)}
      />
    </>
  );
}
