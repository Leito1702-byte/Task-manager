// ============================================================
// Hook: todas las categorías cacheadas en memoria
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { categoriesApi } from '../api/categories';
import type { Categoria } from '../types';

let cache: Categoria[] | null = null;
let inflightPromise: Promise<Categoria[]> | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<Categoria[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = () => {
    cache = null;
    inflightPromise = null;
    setLoading(true);
    load();
  };

  const load = () => {
    if (!inflightPromise) {
      inflightPromise = categoriesApi.getAll();
    }
    inflightPromise
      .then((data) => {
        cache = data;
        inflightPromise = null;
        if (mounted.current) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch(() => {
        inflightPromise = null;
        if (mounted.current) {
          setError('No se pudo cargar las categorías');
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    mounted.current = true;
    if (cache) {
      setCategories(cache);
      setLoading(false);
    } else {
      load();
    }
    return () => {
      mounted.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { categories, loading, error, refresh };
}
