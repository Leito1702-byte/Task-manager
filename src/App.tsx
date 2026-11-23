// ============================================================
// App.tsx – Enrutador y proveedores globales de Task Manager
// Acceso directo con vista Administrador en memoria
// ============================================================
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { KanbanPage } from './pages/KanbanPage';
import { NotFoundPage } from './pages/NotFoundPage';

function DashboardLayout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-150"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((prev) => !prev)}
        viewMode={viewMode}
        onToggleView={() =>
          setViewMode((prev) => (prev === 'kanban' ? 'list' : 'kanban'))
        }
      />
      <main className="flex-1 flex flex-col min-h-0">
        <KanbanPage viewMode={viewMode} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas principales del Tablero */}
            <Route path="/" element={<DashboardLayout />} />
            <Route path="/tareas/:id" element={<DashboardLayout />} />

            {/* Redirección automática de login/register a la vista principal */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}
