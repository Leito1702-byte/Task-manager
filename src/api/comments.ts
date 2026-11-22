// ============================================================
// API – Comentarios
// ============================================================
import apiClient from './client';
import type { Comentario } from '../types';

export const commentsApi = {
  // POST /api/comments → crear comentario; autor sale del token
  create: async (id_tarea: string, contenido: string): Promise<Comentario> => {
    const { data } = await apiClient.post<Comentario>('/comments', {
      id_tarea,
      contenido,
    });
    return data;
  },
};
