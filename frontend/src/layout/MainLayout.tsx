import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@modules/auth/useAuth';
import { useAuthStore } from '@shared/store/authStore';
import { cn } from '@lib/utils';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'Canvas', to: '/project/demo-project/canvas', icon: 'network' },
];

function NavIcon({ name }: { name: string }) {
  if (name === 'network') {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path
          d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.7 6.8l6.6 10.4M8.8 5h6.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path
        d="M4 5a1 1 0 0 1 1-1h5v7H4V5ZM14 4h5a1 1 0 0 1 1 1v4h-6V4ZM4 15h6v5H5a1 1 0 0 1-1-1v-4ZM14 13h6v6a1 1 0 0 1-1 1h-5v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MainLayout({ title, subtitle, children }: MainLayoutProps) {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" to="/dashboard">
          <span className="app-brand__mark">
            <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
              <path
                d="M16 3 5 8.5v9L16 23l11-5.5v-9L16 3Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="16" cy="12" r="3" fill="currentColor" />
              <path d="M16 12 9 17M16 12l7 5" stroke="currentColor" />
            </svg>
          </span>
          <span>
            <span className="app-brand__name">SCNVP</span>
            <span className="app-brand__meta">Network design</span>
          </span>
        </Link>

        <nav className="app-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('app-nav__link', isActive && 'app-nav__link--active')
              }
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="app-topbar__actions">
            <div className="app-user">
              <span className="app-user__avatar">
                {user?.email?.slice(0, 1).toUpperCase() ?? 'U'}
              </span>
              <span className="app-user__details">
                <span>{user?.email ?? 'User'}</span>
                <small>{user?.role ?? 'ENGINEER'}</small>
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
