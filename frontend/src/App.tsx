import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder pages — replace with real modules later
function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">🏙️ SCNVP</h1>
        <p className="text-gray-400 text-center">Login page — coming soon</p>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-400">Your projects will appear here.</p>
    </div>
  );
}

function CanvasPage() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 glass-strong m-2 p-4">
        <h2 className="font-semibold mb-4">Device Palette</h2>
        <p className="text-sm text-gray-400">Drag devices onto the canvas</p>
      </aside>
      <main className="flex-1 m-2 glass flex items-center justify-center">
        <p className="text-gray-500">Network Canvas (React Flow) — coming soon</p>
      </main>
      <aside className="w-72 glass-strong m-2 p-4">
        <h2 className="font-semibold mb-4">Inspector</h2>
        <p className="text-sm text-gray-400">Select a node to inspect</p>
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project/:id/canvas" element={<CanvasPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
