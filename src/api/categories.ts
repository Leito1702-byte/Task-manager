// ============================================================
// API – Categorías
// ============================================================
import apiClient from './client';
import type { Categoria } from '../types';

export const categoriesApi = {
  // GET /api/categories → todas las categorías (additive endpoint)
  getAll: async (): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>('/categories');
    return data;
  },

  // POST /api/categories → crea y asocia a una tarea
  create: async (body: {
    id_tarea: string;
    nombre: string;
    descripcion?: string;
    color: string;
  }): Promise<Categoria> => {
    const { data } = await apiClient.post<Categoria>('/categories', body);
    return data;
  },

  // PATCH /api/categories/:id → actualizar (solo nombre, descripcion, color)
  update: async (
    id: string,
    body: { nombre?: string; descripcion?: string; color?: string }
  ): Promise<Categoria> => {
    const { data } = await apiClient.patch<Categoria>(`/categories/${id}`, body);
    return data;
  },

  // DELETE /api/categories/:id → elimina de TODAS las tareas
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },
};
