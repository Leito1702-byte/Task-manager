// ============================================================
// API – Usuarios
// ============================================================
import apiClient from './client';
import type { Usuario } from '../types';

export const usersApi = {
  // GET /api/users → lista de usuarios sin contraseña (additive endpoint)
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await apiClient.get<Usuario[]>('/users');
    return data;
  },
};
