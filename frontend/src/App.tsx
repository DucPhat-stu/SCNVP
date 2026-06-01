import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MainLayout } from '@/layout/MainLayout';
import { AuthPage } from '@modules/auth/AuthPage';
import { NetworkCanvas } from '@modules/canvas/NetworkCanvas';
import { useAuthStore } from '@shared/store/authStore';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function DashboardPage() {
  return (
    <MainLayout
      title="Dashboard"
      subtitle="Project workspace and sprint-one navigation."
    >
      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <h2 className="dashboard-card__title">Demo City Backbone</h2>
            <p className="dashboard-card__meta">Draft topology</p>
          </CardHeader>
          <CardContent>
            <p className="dashboard-card__copy">
              Open the canvas to place network devices, connect them, and
              validate the first builder workflow.
            </p>
            <a className="dashboard-card__link" href="/project/demo-project/canvas">
              Open canvas
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="dashboard-card__title">Sprint 1 Coverage</h2>
            <p className="dashboard-card__meta">Auth, layout, canvas</p>
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <span>Ready tasks</span>
              <strong>8</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function CanvasPage() {
  return (
    <MainLayout
      title="Network Canvas"
      subtitle="Drag devices, move nodes, connect endpoints, and delete selections."
    >
      <NetworkCanvas />
    </MainLayout>
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
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage mode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthPage mode="register" />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/canvas"
          element={
            <ProtectedRoute>
              <CanvasPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
