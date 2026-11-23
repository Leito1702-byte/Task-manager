// ============================================================
// Contexto de autenticación
// Provee sesión persistente y perfil de Administrador por defecto
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ADMIN_USER } from '../api/memoryStore';
import type { JwtPayload } from '../types';

interface AuthContextValue {
  currentUser: JwtPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  register: (nombre: string, email: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAdminPayload: JwtPayload = {
  sub: ADMIN_USER.id_usuario,
  email: ADMIN_USER.email,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Por defecto el usuario siempre está autenticado con rol Administrador
  const [token, setToken] = useState<string | null>('demo-token-admin');
  const [currentUser, setCurrentUser] = useState<JwtPayload | null>(defaultAdminPayload);

  const login = useCallback(async (email: string) => {
    const payload = { sub: ADMIN_USER.id_usuario, email };
    setCurrentUser(payload);
    setToken('demo-token-admin');
  }, []);

  const register = useCallback(async (_nombre: string, email: string) => {
    const payload = { sub: ADMIN_USER.id_usuario, email };
    setCurrentUser(payload);
    setToken('demo-token-admin');
  }, []);

  const logout = useCallback(async () => {
    // Al salir, reinicia el estado pero mantiene acceso de invitado/demo
    setToken('demo-token-admin');
    setCurrentUser(defaultAdminPayload);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: true,
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
