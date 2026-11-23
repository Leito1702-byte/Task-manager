// ============================================================
// Almacén en memoria (RAM) para modo independiente / Cloudflare
// ============================================================
import type { Tarea, TareaDetalle, Categoria, Comentario, Usuario, Estado, JwtPayload } from '../types';

export const ADMIN_USER: Usuario = {
  id_usuario: '11111111-1111-1111-1111-111111111111',
  nombre: 'Leonardo Mata (Admin)',
  email: 'admin@taskmanager.com',
};

export const DEMO_USERS: Usuario[] = [
  ADMIN_USER,
  {
    id_usuario: '22222222-2222-2222-2222-222222222222',
    nombre: 'Joselito Pérez',
    email: 'joselito1723@gmail.com',
  },
  {
    id_usuario: '33333333-3333-3333-3333-333333333333',
    nombre: 'María Peña',
    email: 'mariapena235@hotmail.com',
  },
  {
    id_usuario: '44444444-4444-4444-4444-444444444444',
    nombre: 'Juanito Gamer',
    email: 'juanitogamer18@gmail.com',
  },
];

let categoriesStore: Categoria[] = [
  { id_categoria: 'cat-1', nombre: 'Urgente', descripcion: 'Prioridad máxima', color: '#EF4444' },
  { id_categoria: 'cat-2', nombre: 'Mejora', descripcion: 'Optimización y refactor', color: '#3B82F6' },
  { id_categoria: 'cat-3', nombre: 'Bug', descripcion: 'Corrección de errores', color: '#F97316' },
];

let tasksStore: (Tarea & { categorias: Categoria[]; comentarios: Comentario[] })[] = [
  {
    id_tarea: 'task-1',
    nombre: 'Implementar autenticación con JWT',
    descripcion: 'Generar token seguro con expiración de 8 horas y claims de usuario.',
    story_points: 5,
    estado: 'COMPLETADO',
    fecha_entrega: new Date(Date.now() - 86400000 * 2).toISOString(),
    id_creador: ADMIN_USER.id_usuario,
    id_asignado: ADMIN_USER.id_usuario,
    categorias: [categoriesStore[0]],
    comentarios: [
      {
        id_comentario: 'c-1',
        contenido: 'Guards y estrategia JWT completados con éxito.',
        fecha: new Date(Date.now() - 86400000).toISOString(),
        id_tarea: 'task-1',
        id_usuario: ADMIN_USER.id_usuario,
      },
    ],
  },
  {
    id_tarea: 'task-2',
    nombre: 'Construir tablero Kanban interactivo',
    descripcion: 'Soporte completo drag and drop con @dnd-kit y actualización optimista.',
    story_points: 8,
    estado: 'EN_PROGRESO',
    fecha_entrega: new Date(Date.now() + 86400000 * 3).toISOString(),
    id_creador: ADMIN_USER.id_usuario,
    id_asignado: DEMO_USERS[1].id_usuario,
    categorias: [categoriesStore[1]],
    comentarios: [],
  },
  {
    id_tarea: 'task-3',
    nombre: 'Revisión de rendimiento en base de datos',
    descripcion: 'Optimizar índices en tabla de tareas y pool de conexiones PostgreSQL.',
    story_points: 3,
    estado: 'EN_REVISION',
    fecha_entrega: new Date(Date.now() + 86400000 * 5).toISOString(),
    id_creador: ADMIN_USER.id_usuario,
    id_asignado: DEMO_USERS[2].id_usuario,
    categorias: [categoriesStore[2]],
    comentarios: [],
  },
  {
    id_tarea: 'task-4',
    nombre: 'Diseñar suite de pruebas E2E',
    descripcion: 'Validar flujos de endpoints para tareas, comentarios y categorías.',
    story_points: 4,
    estado: 'PENDIENTE',
    fecha_entrega: new Date(Date.now() + 86400000 * 7).toISOString(),
    id_creador: ADMIN_USER.id_usuario,
    id_asignado: DEMO_USERS[3].id_usuario,
    categorias: [],
    comentarios: [],
  },
];

// Helper ID generator
function generateId() {
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
}

// ================= API EN MEMORIA (RAM) =================
export const memoryStore = {
  // Auth
  getCurrentUser: (): JwtPayload => ({
    sub: ADMIN_USER.id_usuario,
    email: ADMIN_USER.email,
  }),

  // Users
  getUsers: async (): Promise<Usuario[]> => {
    return [...DEMO_USERS];
  },

  // Categories
  getCategories: async (): Promise<Categoria[]> => {
    return [...categoriesStore];
  },

  createCategory: async (body: {
    id_tarea: string;
    nombre: string;
    descripcion?: string;
    color: string;
  }): Promise<Categoria> => {
    const newCat: Categoria = {
      id_categoria: generateId(),
      nombre: body.nombre,
      descripcion: body.descripcion || '',
      color: body.color,
    };
    categoriesStore.push(newCat);

    // Asociar a la tarea
    const task = tasksStore.find((t) => t.id_tarea === body.id_tarea);
    if (task && !task.categorias.some((c) => c.id_categoria === newCat.id_categoria)) {
      task.categorias.push(newCat);
    }
    return newCat;
  },

  updateCategory: async (
    id: string,
    body: { nombre?: string; descripcion?: string; color?: string }
  ): Promise<Categoria> => {
    const cat = categoriesStore.find((c) => c.id_categoria === id);
    if (!cat) throw new Error('Categoría no encontrada');
    if (body.nombre) cat.nombre = body.nombre;
    if (body.descripcion !== undefined) cat.descripcion = body.descripcion;
    if (body.color) cat.color = body.color;

    // Actualizar también en tareas que la tengan
    tasksStore.forEach((t) => {
      const idx = t.categorias.findIndex((c) => c.id_categoria === id);
      if (idx !== -1) t.categorias[idx] = { ...cat };
    });

    return { ...cat };
  },

  deleteCategory: async (id: string) => {
    categoriesStore = categoriesStore.filter((c) => c.id_categoria !== id);
    tasksStore.forEach((t) => {
      t.categorias = t.categorias.filter((c) => c.id_categoria !== id);
    });
    return { message: 'Categoría eliminada' };
  },

  // Tasks
  getTasks: async (userId?: string, estado?: string): Promise<Tarea[]> => {
    let result = [...tasksStore];
    if (userId) {
      result = result.filter((t) => t.id_asignado === userId);
    }
    if (estado) {
      result = result.filter((t) => t.estado === estado);
    }
    return result.map(({ categorias, comentarios, ...t }) => t);
  },

  getTaskOne: async (id: string): Promise<TareaDetalle> => {
    const task = tasksStore.find((t) => t.id_tarea === id);
    if (!task) throw new Error('Tarea no encontrada');
    return {
      ...task,
      categorias: [...task.categorias],
      comentarios: [...task.comentarios],
    };
  },

  createTask: async (body: {
    nombre: string;
    descripcion?: string;
    story_points?: number;
    fecha_entrega?: string;
    id_asignado: string;
  }): Promise<Tarea> => {
    const newTask = {
      id_tarea: generateId(),
      nombre: body.nombre,
      descripcion: body.descripcion || '',
      story_points: body.story_points ?? 0,
      estado: 'PENDIENTE' as Estado,
      fecha_entrega: body.fecha_entrega,
      id_creador: ADMIN_USER.id_usuario,
      id_asignado: body.id_asignado,
      categorias: [],
      comentarios: [],
    };
    tasksStore.unshift(newTask);
    const { categorias, comentarios, ...plain } = newTask;
    return plain;
  },

  updateTask: async (
    id: string,
    body: Partial<{
      nombre: string;
      descripcion: string;
      story_points: number;
      estado: Estado;
      fecha_entrega: string;
      id_asignado: string;
    }>
  ): Promise<Tarea> => {
    const task = tasksStore.find((t) => t.id_tarea === id);
    if (!task) throw new Error('Tarea no encontrada');
    Object.assign(task, body);
    const { categorias, comentarios, ...plain } = task;
    return plain;
  },

  addTaskCategory: async (id_tarea: string, id_categoria: string) => {
    const task = tasksStore.find((t) => t.id_tarea === id_tarea);
    const cat = categoriesStore.find((c) => c.id_categoria === id_categoria);
    if (task && cat && !task.categorias.some((c) => c.id_categoria === id_categoria)) {
      task.categorias.push(cat);
    }
    return { message: 'Categoría asociada' };
  },

  getAvailableCategories: async (id_tarea: string): Promise<Categoria[]> => {
    const task = tasksStore.find((t) => t.id_tarea === id_tarea);
    if (!task) return [...categoriesStore];
    const attachedIds = new Set(task.categorias.map((c) => c.id_categoria));
    return categoriesStore.filter((c) => !attachedIds.has(c.id_categoria));
  },

  // Comments
  createComment: async (id_tarea: string, contenido: string): Promise<Comentario> => {
    const task = tasksStore.find((t) => t.id_tarea === id_tarea);
    if (!task) throw new Error('Tarea no encontrada');
    const newComment: Comentario = {
      id_comentario: generateId(),
      contenido,
      fecha: new Date().toISOString(),
      id_tarea,
      id_usuario: ADMIN_USER.id_usuario,
    };
    task.comentarios.push(newComment);
    return newComment;
  },
};
