// ============================================================
// API – Tareas (memoria RAM autónoma)
// ============================================================
import { memoryStore } from './memoryStore';
import type { Tarea, TareaDetalle, Estado } from '../types';

export const tasksApi = {
  getAll: async (userId?: string, estado?: string): Promise<Tarea[]> => {
    return memoryStore.getTasks(userId, estado);
  },

  getOne: async (id: string): Promise<TareaDetalle> => {
    return memoryStore.getTaskOne(id);
  },

  create: async (body: {
    nombre: string;
    descripcion?: string;
    story_points?: number;
    fecha_entrega?: string;
    id_asignado: string;
  }): Promise<Tarea> => {
    return memoryStore.createTask(body);
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
    return memoryStore.updateTask(id, body);
  },

  addCategory: async (id_tarea: string, id_categoria: string) => {
    return memoryStore.addTaskCategory(id_tarea, id_categoria);
  },

  getAvailableCategories: async (id_tarea: string) => {
    return memoryStore.getAvailableCategories(id_tarea);
  },
};
