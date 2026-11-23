// ============================================================
// API – Comentarios (memoria RAM autónoma)
// ============================================================
import { memoryStore } from './memoryStore';
import type { Comentario } from '../types';

export const commentsApi = {
  create: async (id_tarea: string, contenido: string): Promise<Comentario> => {
    return memoryStore.createComment(id_tarea, contenido);
  },
};
