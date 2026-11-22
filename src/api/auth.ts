// ============================================================
// API – Autenticación
// ============================================================
import apiClient from './client';

export const authApi = {
  // POST /api/auth/register → { token, usuario }
  register: async (nombre: string, email: string, contrasena: string) => {
    const { data } = await apiClient.post<{
      token: string;
      usuario: { id_usuario: string; nombre: string; email: string };
    }>('/auth/register', {
      nombre,
      email,
      contrasena,
    });
    return data;
  },

  // POST /api/auth/login → { token }
  login: async (email: string, contrasena: string) => {
    const { data } = await apiClient.post<{ token: string }>('/auth/login', {
      email,
      contrasena,
    });
    return data;
  },

  // POST /api/auth/logout → { message }
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignora el error; siempre limpia la sesión localmente
    }
  },
};
