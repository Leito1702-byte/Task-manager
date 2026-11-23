// ============================================================
// API – Usuarios (usa memoryStore para garantizar funcionamiento autónomo)
// ============================================================
import apiClient from './client';
import { memoryStore } from './memoryStore';
import type { Usuario } from '../types';

export const usersApi = {
  getAll: async (): Promise<Usuario[]> => {
    try {
      const { data } = await apiClient.get<Usuario[]>('/users', { timeout: 1500 });
      return data;
    } catch {
      return memoryStore.getUsers();
    }
  },
};
