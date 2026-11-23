// ============================================================
// API – Usuarios (prioriza memoria RAM inmediata)
// ============================================================
import { memoryStore } from './memoryStore';
import type { Usuario } from '../types';

export const usersApi = {
  getAll: async (): Promise<Usuario[]> => {
    return memoryStore.getUsers();
  },
};
