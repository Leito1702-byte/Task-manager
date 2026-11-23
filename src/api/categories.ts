// ============================================================
// API – Categorías (respaldo en memoria RAM para Cloudflare)
// ============================================================
import apiClient from './client';
import { memoryStore } from './memoryStore';
import type { Categoria } from '../types';

export const categoriesApi = {
  getAll: async (): Promise<Categoria[]> => {
    try {
      const { data } = await apiClient.get<Categoria[]>('/categories', { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.getCategories();
    }
  },

  create: async (body: {
    id_tarea: string;
    nombre: string;
    descripcion?: string;
    color: string;
  }): Promise<Categoria> => {
    try {
      const { data } = await apiClient.post<Categoria>('/categories', body, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.createCategory(body);
    }
  },

  update: async (
    id: string,
    body: { nombre?: string; descripcion?: string; color?: string }
  ): Promise<Categoria> => {
    try {
      const { data } = await apiClient.patch<Categoria>(`/categories/${id}`, body, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.updateCategory(id, body);
    }
  },

  delete: async (id: string) => {
    try {
      const { data } = await apiClient.delete(`/categories/${id}`, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.deleteCategory(id);
    }
  },
};
