// ============================================================
// Contexto de autenticación
// Provee: currentUser, login(), logout(), isAuthenticated
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { decodeJwt } from './jwtDecode';
import type { JwtPayload } from '../types';

interface AuthContextValue {
  currentUser: JwtPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  register: (nombre: string, email: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getUserFromStorage(): JwtPayload | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return decodeJwt(token);
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<JwtPayload | null>(getUserFromStorage);

  const login = useCallback(async (email: string, contrasena: string) => {
    const { token: newToken } = await authApi.login(email, contrasena);
    const payload = decodeJwt(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setCurrentUser(payload);
  }, []);

  const register = useCallback(async (nombre: string, email: string, contrasena: string) => {
    const { token: newToken } = await authApi.register(nombre, email, contrasena);
    const payload = decodeJwt(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setCurrentUser(payload);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
