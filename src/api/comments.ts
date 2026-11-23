// ============================================================
// API – Comentarios (respaldo en memoria RAM para Cloudflare)
// ============================================================
import apiClient from './client';
import { memoryStore } from './memoryStore';
import type { Comentario } from '../types';

export const commentsApi = {
  create: async (id_tarea: string, contenido: string): Promise<Comentario> => {
    try {
      const { data } = await apiClient.post<Comentario>('/comments', {
        id_tarea,
        contenido,
      }, { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.createComment(id_tarea, contenido);
    }
  },
};
