import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@modules/auth/AuthPage';
import { useAuthStore } from '@shared/store/authStore';

function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-400">Your projects will appear here.</p>
    </div>
  );
}

function CanvasPage() {
  return (
    <div className="flex h-screen">
      <aside className="glass-strong m-2 w-64 p-4">
        <h2 className="mb-4 font-semibold">Device Palette</h2>
        <p className="text-sm text-gray-400">Drag devices onto the canvas</p>
      </aside>
      <main className="glass m-2 flex flex-1 items-center justify-center">
        <p className="text-gray-500">Network Canvas (React Flow) coming soon</p>
      </main>
      <aside className="glass-strong m-2 w-72 p-4">
        <h2 className="mb-4 font-semibold">Inspector</h2>
        <p className="text-sm text-gray-400">Select a node to inspect</p>
      </aside>
    </div>
  );
}

export default function App() {
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project/:id/canvas" element={<CanvasPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
