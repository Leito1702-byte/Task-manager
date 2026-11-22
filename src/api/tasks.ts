// ============================================================
// API – Tareas
// ============================================================
import apiClient from './client';
import type { Tarea, TareaDetalle, Estado } from '../types';

export const tasksApi = {
  // GET /api/tasks?userId=&estado=
  getAll: async (userId?: string, estado?: string): Promise<Tarea[]> => {
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (estado) params.estado = estado;
    const { data } = await apiClient.get<Tarea[]>('/tasks', { params });
    return data;
  },

  // GET /api/tasks/:id → tarea + comentarios + categorias
  getOne: async (id: string): Promise<TareaDetalle> => {
    const { data } = await apiClient.get<TareaDetalle>(`/tasks/${id}`);
    return data;
  },

  // POST /api/tasks
  create: async (body: {
    nombre: string;
    descripcion?: string;
    story_points?: number;
    fecha_entrega?: string;
    id_asignado: string;
  }): Promise<Tarea> => {
    const { data } = await apiClient.post<Tarea>('/tasks', body);
    return data;
  },

  // PATCH /api/tasks/:id — solo los campos permitidos
  update: async (
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
    const { data } = await apiClient.patch<Tarea>(`/tasks/${id}`, body);
    return data;
  },

  // POST /api/tasks/:id/categories → asociar categoría existente
  addCategory: async (id_tarea: string, id_categoria: string) => {
    const { data } = await apiClient.post(`/tasks/${id_tarea}/categories`, {
      id_categoria,
    });
    return data;
  },

  // GET /api/tasks/:id/categories/available
  getAvailableCategories: async (id_tarea: string) => {
    const { data } = await apiClient.get(`/tasks/${id_tarea}/categories/available`);
    return data;
  },
};
