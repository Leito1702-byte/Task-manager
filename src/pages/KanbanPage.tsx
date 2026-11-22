// ============================================================
// KanbanPage – Tablero Kanban con Drag & Drop, filtros y detalle
// ============================================================
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { tasksApi } from '../api/tasks';
import { useAuth } from '../auth/AuthContext';
import { useToast, formatNestError } from '../hooks/useToast';
import { useUsers } from '../hooks/useUsers';
import { useCategories } from '../hooks/useCategories';
import { TaskCard } from '../components/TaskCard';
import { ListView } from '../components/ListView';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { SkeletonCard } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { ESTADOS, ESTADO_LABELS, ESTADO_COLORS } from '../types';
import type { Tarea, TareaDetalle, Estado } from '../types';

interface KanbanColumnProps {
  estado: Estado;
  tareas: Tarea[];
  detalles: Record<string, TareaDetalle>;
  loadingDetalles: Record<string, boolean>;
  onMoverA: (tareaId: string, nuevoEstado: Estado) => void;
  onNuevaTarea: () => void;
}

function KanbanColumn({
  estado,
  tareas,
  detalles,
  loadingDetalles,
  onMoverA,
  onNuevaTarea,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  const totalSP = useMemo(
    () => tareas.reduce((acc, t) => acc + (t.story_points ?? 0), 0),
    [tareas]
  );
  const color = ESTADO_COLORS[estado];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl border p-3.5 transition-colors duration-150 snap-center ${
        isOver ? 'ring-2 ring-indigo-400/50 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
      }`}
      style={{
        background: 'var(--color-surface-2)',
        borderColor: 'var(--color-border)',
        minHeight: '480px',
      }}
    >
      {/* Cabecera de columna */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <h2
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--color-text)' }}
          >
            {ESTADO_LABELS[estado]}
          </h2>
          <span
            className="text-[11px] font-mono px-1.5 py-0.2 rounded-full font-semibold"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
          >
            {tareas.length}
          </span>
        </div>

        {totalSP > 0 && (
          <span
            className="text-[11px] font-mono font-medium text-neutral-500 dark:text-zinc-400"
            title="Suma total de Story Points en esta columna"
          >
            {totalSP} SP
          </span>
        )}
      </div>

      {/* Lista de tarjetas */}
      <SortableContext
        items={tareas.map((t) => t.id_tarea)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
          {tareas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-neutral-300 dark:border-zinc-700/60 text-xs text-neutral-400 dark:text-zinc-500 min-h-[140px]">
              <span>Sin tareas</span>
              {estado === 'PENDIENTE' && (
                <button
                  onClick={onNuevaTarea}
                  className="mt-2 text-indigo-500 hover:underline font-medium cursor-pointer"
                >
                  + Crear tarea
                </button>
              )}
            </div>
          ) : (
            tareas.map((tarea) => (
              <TaskCard
                key={tarea.id_tarea}
                tarea={tarea}
                detalle={detalles[tarea.id_tarea]}
                loadingDetalle={loadingDetalles[tarea.id_tarea]}
                onMoverA={(nuevo) => onMoverA(tarea.id_tarea, nuevo)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanPageProps {
  viewMode: 'kanban' | 'list';
}

export function KanbanPage({ viewMode }: KanbanPageProps) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { users } = useUsers();
  const { categories } = useCategories();
  const { id: routeTaskId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Estados de datos
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtros
  const [filtroSoloMias, setFiltroSoloMias] = useState(false);
  const [filtroAsignado, setFiltroAsignado] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Cache de detalles cargados en segundo plano
  const [detalles, setDetalles] = useState<Record<string, TareaDetalle>>({});
  const [loadingDetalles, setLoadingDetalles] = useState<Record<string, boolean>>({});
  const inflightRef = useRef<Set<string>>(new Set());

  // Sensors para drag & drop accesible
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Cargar lista de tareas principal
  const cargarTareas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userIdParam = filtroSoloMias && currentUser ? currentUser.sub : undefined;
      const data = await tasksApi.getAll(userIdParam);
      setTareas(data);
    } catch {
      setError('No se pudieron cargar las tareas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [filtroSoloMias, currentUser]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  // Cargar detalles en segundo plano (máx. 5 en paralelo)
  useEffect(() => {
    if (tareas.length === 0) return;

    const faltantes = tareas
      .map((t) => t.id_tarea)
      .filter((id) => !detalles[id] && !inflightRef.current.has(id));

    if (faltantes.length === 0) return;

    // Ejecutor con concurrencia máxima 5
    let index = 0;
    const maxConcurrency = 5;

    const ejecutarSiguiente = async () => {
      if (index >= faltantes.length) return;
      const id = faltantes[index++];
      inflightRef.current.add(id);
      setLoadingDetalles((prev) => ({ ...prev, [id]: true }));

      try {
        const det = await tasksApi.getOne(id);
        setDetalles((prev) => ({ ...prev, [id]: det }));
      } catch {
        // En caso de fallo silencioso en background, no bloquea el tablero
      } finally {
        inflightRef.current.delete(id);
        setLoadingDetalles((prev) => ({ ...prev, [id]: false }));
        void ejecutarSiguiente();
      }
    };

    const activos = Math.min(maxConcurrency, faltantes.length);
    for (let i = 0; i < activos; i++) {
      void ejecutarSiguiente();
    }
  }, [tareas, detalles]);

  // Actualización optimista de estado
  const moverTarea = async (tareaId: string, nuevoEstado: Estado) => {
    const tareaActual = tareas.find((t) => t.id_tarea === tareaId);
    if (!tareaActual || tareaActual.estado === nuevoEstado) return;

    const estadoAnterior = tareaActual.estado;

    // 1. Optimistic update
    setTareas((prev) =>
      prev.map((t) => (t.id_tarea === tareaId ? { ...t, estado: nuevoEstado } : t))
    );
    if (detalles[tareaId]) {
      setDetalles((prev) => ({
        ...prev,
        [tareaId]: { ...prev[tareaId], estado: nuevoEstado },
      }));
    }

    // 2. PATCH al backend
    try {
      await tasksApi.update(tareaId, { estado: nuevoEstado });
    } catch (err) {
      // Revertir optimismo
      setTareas((prev) =>
        prev.map((t) => (t.id_tarea === tareaId ? { ...t, estado: estadoAnterior } : t))
      );
      if (detalles[tareaId]) {
        setDetalles((prev) => ({
          ...prev,
          [tareaId]: { ...prev[tareaId], estado: estadoAnterior },
        }));
      }
      addToast(formatNestError(err), 'error');
    }
  };

  // Manejador de fin de arrastre DndKit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Si se suelta sobre una columna directamente (el id es el Estado)
    if (ESTADOS.includes(overId as Estado)) {
      void moverTarea(activeId, overId as Estado);
      return;
    }

    // Si se suelta sobre otra tarjeta, obtener el estado de esa tarjeta
    const targetTask = tareas.find((t) => t.id_tarea === overId);
    if (targetTask) {
      void moverTarea(activeId, targetTask.estado);
    }
  };

  // Filtros aplicados en cliente
  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      // Filtro asignado
      if (filtroAsignado && t.id_asignado !== filtroAsignado) return false;

      // Filtro categoría (utiliza datos de detalles)
      if (filtroCategoria) {
        const det = detalles[t.id_tarea];
        if (!det) return true; // Si aún carga, se mantiene en vista
        const tieneCat = det.categorias.some((c) => c.id_categoria === filtroCategoria);
        if (!tieneCat) return false;
      }

      // Filtro búsqueda de texto
      if (filtroBusqueda.trim()) {
        const query = filtroBusqueda.toLowerCase();
        const coincideNombre = t.nombre.toLowerCase().includes(query);
        const coincideDesc = t.descripcion?.toLowerCase().includes(query) ?? false;
        if (!coincideNombre && !coincideDesc) return false;
      }

      return true;
    });
  }, [tareas, filtroAsignado, filtroCategoria, filtroBusqueda, detalles]);

  // Agrupación por estado
  const tareasPorEstado = useMemo(() => {
    const map: Record<Estado, Tarea[]> = {
      PENDIENTE: [],
      EN_PROGRESO: [],
      EN_REVISION: [],
      COMPLETADO: [],
    };
    for (const t of tareasFiltradas) {
      if (map[t.estado]) {
        map[t.estado].push(t);
      }
    }
    return map;
  }, [tareasFiltradas]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Barra de herramientas / Filtros */}
      <div
        className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 sticky top-14 z-20"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Toggle Mis Tareas / Todas */}
          <div
            className="flex rounded-lg border p-0.5 font-medium"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              onClick={() => setFiltroSoloMias(false)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !filtroSoloMias
                  ? 'bg-white dark:bg-zinc-800 font-semibold shadow-xs'
                  : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
              }`}
              style={!filtroSoloMias ? { color: 'var(--color-text)' } : {}}
            >
              Todas ({tareas.length})
            </button>
            <button
              onClick={() => setFiltroSoloMias(true)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filtroSoloMias
                  ? 'bg-white dark:bg-zinc-800 font-semibold shadow-xs'
                  : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100'
              }`}
              style={filtroSoloMias ? { color: 'var(--color-text)' } : {}}
            >
              Mis tareas
            </button>
          </div>

          {/* Filtro por Asignado */}
          <select
            value={filtroAsignado}
            onChange={(e) => setFiltroAsignado(e.target.value)}
            className="rounded-lg border px-2.5 py-1.5 outline-none font-medium"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="">Todos los asignados</option>
            {users.map((u) => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por Categoría */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="rounded-lg border px-2.5 py-1.5 outline-none font-medium"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* Buscador de texto */}
          <input
            type="text"
            placeholder="Buscar por texto…"
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="rounded-lg border px-3 py-1.5 outline-none w-44 sm:w-52"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Botón Nueva Tarea */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
        >
          + Nueva tarea
        </button>
      </div>

      {/* Contenido principal: Tablero Kanban o Vista Lista */}
      <div className="flex-1 overflow-x-auto p-6 min-h-0">
        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-72 sm:w-80 shrink-0 space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={cargarTareas} />
        ) : viewMode === 'list' ? (
          <ListView
            tareas={tareasFiltradas}
            onNuevaTarea={() => setShowCreateModal(true)}
          />
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory">
              {ESTADOS.map((estado) => (
                <KanbanColumn
                  key={estado}
                  estado={estado}
                  tareas={tareasPorEstado[estado]}
                  detalles={detalles}
                  loadingDetalles={loadingDetalles}
                  onMoverA={moverTarea}
                  onNuevaTarea={() => setShowCreateModal(true)}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>

      {/* Modal Crear Tarea */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(nueva) => {
            setTareas((prev) => [nueva, ...prev]);
          }}
        />
      )}

      {/* Panel Detalle de Tarea (enlazado a /tareas/:id) */}
      {routeTaskId && (
        <TaskDetailPanel
          tareaId={routeTaskId}
          onClose={() => navigate('/')}
          onUpdated={(actualizada) => {
            setTareas((prev) =>
              prev.map((t) => (t.id_tarea === actualizada.id_tarea ? actualizada : t))
            );
            setDetalles((prev) => ({
              ...prev,
              [actualizada.id_tarea]: actualizada,
            }));
          }}
        />
      )}
    </div>
  );
}
