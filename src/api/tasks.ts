// ============================================================
// API – Tareas (respaldo en memoria RAM para Cloudflare)
// ============================================================
import apiClient from './client';
import { memoryStore } from './memoryStore';
import type { Tarea, TareaDetalle, Estado } from '../types';

export const tasksApi = {
  getAll: async (userId?: string, estado?: string): Promise<Tarea[]> => {
    try {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (estado) params.estado = estado;
      const { data } = await apiClient.get<Tarea[]>('/tasks', { params, timeout: 1500 });
      return data;
    } catch {
      return memoryStore.getTasks(userId, estado);
    }
  },

  getOne: async (id: string): Promise<TareaDetalle> => {
    try {
      const { data } = await apiClient.get<TareaDetalle>(`/tasks/${id}`, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.getTaskOne(id);
    }
  },

  create: async (body: {
    nombre: string;
    descripcion?: string;
    story_points?: number;
    fecha_entrega?: string;
    id_asignado: string;
  }): Promise<Tarea> => {
    try {
      const { data } = await apiClient.post<Tarea>('/tasks', body, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.createTask(body);
    }
  },

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
    try {
      const { data } = await apiClient.patch<Tarea>(`/tasks/${id}`, body, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.updateTask(id, body);
    }
  },

  addCategory: async (id_tarea: string, id_categoria: string) => {
    try {
      const { data } = await apiClient.post(`/tasks/${id_tarea}/categories`, {
        id_categoria,
      }, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.addTaskCategory(id_tarea, id_categoria);
    }
  },

  getAvailableCategories: async (id_tarea: string) => {
    try {
      const { data } = await apiClient.get(`/tasks/${id_tarea}/categories/available`, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.getAvailableCategories(id_tarea);
    }
  },
};
