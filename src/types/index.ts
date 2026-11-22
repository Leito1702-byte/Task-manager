// ============================================================
// Tipos centrales del Task Manager
// ============================================================

export type Estado = 'PENDIENTE' | 'EN_PROGRESO' | 'EN_REVISION' | 'COMPLETADO';

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
}

export interface Categoria {
  id_categoria: string;
  nombre: string;
  descripcion?: string;
  color: string; // #RRGGBB
}

export interface Comentario {
  id_comentario: string;
  contenido: string;
  fecha: string;
  id_tarea: string;
  id_usuario: string;
}

export interface Tarea {
  id_tarea: string;
  nombre: string;
  descripcion?: string;
  story_points?: number;
  estado: Estado;
  fecha_entrega?: string;
  id_creador: string;
  id_asignado: string;
}

export interface TareaDetalle extends Tarea {
  comentarios: Comentario[];
  categorias: Categoria[];
}

// Payload JWT decodificado
export interface JwtPayload {
  sub: string;    // id_usuario
  email: string;
  iat?: number;
  exp?: number;
}

// Error estándar de NestJS
export interface NestError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Etiquetas legibles para cada estado
export const ESTADO_LABELS: Record<Estado, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  EN_REVISION: 'En revisión',
  COMPLETADO:  'Completado',
};

// Color CSS por estado
export const ESTADO_COLORS: Record<Estado, string> = {
  PENDIENTE:   '#94a3b8',
  EN_PROGRESO: '#3b82f6',
  EN_REVISION: '#f59e0b',
  COMPLETADO:  '#22c55e',
};

export const ESTADOS: Estado[] = ['PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADO'];
