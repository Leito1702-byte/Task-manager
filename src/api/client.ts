// ============================================================
// Cliente HTTP base (axios)
// ============================================================
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

// Request: añade token si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: en modo demo/cloudflare nunca forzar recarga en bucle a /login ante 401/405
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
