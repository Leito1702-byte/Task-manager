// ============================================================
// Hook: lista de usuarios cacheada en memoria
// Resuelve UUID → nombre para comentarios y tareas
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { usersApi } from '../api/users';
import type { Usuario } from '../types';

// Cache compartido entre instancias del hook
let cache: Usuario[] | null = null;
let inflightPromise: Promise<Usuario[]> | null = null;

export function useUsers() {
  const [users, setUsers] = useState<Usuario[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cache) {
      setUsers(cache);
      setLoading(false);
      return;
    }

    if (!inflightPromise) {
      inflightPromise = usersApi.getAll();
    }

    inflightPromise
      .then((data) => {
        cache = data;
        inflightPromise = null;
        if (mounted.current) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        inflightPromise = null;
        if (mounted.current) {
          setError('No se pudo cargar la lista de usuarios');
          setLoading(false);
        }
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  // Resuelve id_usuario → nombre legible
  const resolveNombre = (id: string): string => {
    const user = users.find((u) => u.id_usuario === id);
    return user?.nombre ?? id.slice(0, 8) + '…';
  };

  // Resuelve id_usuario → iniciales (máx. 2 letras)
  const resolveIniciales = (id: string): string => {
    const user = users.find((u) => u.id_usuario === id);
    if (!user) return '??';
    return user.nombre
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return { users, loading, error, resolveNombre, resolveIniciales };
}
