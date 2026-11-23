// ============================================================
// API – Categorías (memoria RAM autónoma)
// ============================================================
import { memoryStore } from './memoryStore';
import type { Categoria } from '../types';

export const categoriesApi = {
  getAll: async (): Promise<Categoria[]> => {
    return memoryStore.getCategories();
  },

  create: async (body: {
    id_tarea: string;
    nombre: string;
    descripcion?: string;
    color: string;
  }): Promise<Categoria> => {
    return memoryStore.createCategory(body);
  },

  update: async (
    id: string,
    body: { nombre?: string; descripcion?: string; color?: string }
  ): Promise<Categoria> => {
    return memoryStore.updateCategory(id, body);
  },

  delete: async (id: string) => {
    return memoryStore.deleteCategory(id);
  },
};
