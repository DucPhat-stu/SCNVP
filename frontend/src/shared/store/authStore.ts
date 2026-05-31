import { create } from 'zustand';
import type { User } from '@shared/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

interface StoredAuth {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

function emptyAuth(): StoredAuth {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
}

function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function readStoredAuth(): StoredAuth {
  if (typeof window === 'undefined') {
    return emptyAuth();
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);

  if (!accessToken || !userJson) {
    return emptyAuth();
  }

  try {
    const user = JSON.parse(userJson) as User;
    return { user, accessToken, refreshToken, isAuthenticated: true };
  } catch {
    clearStoredAuth();
    return emptyAuth();
  }
}

interface AuthState extends StoredAuth {
  isLoading: boolean;
  error: string | null;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

const storedAuth = readStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  ...storedAuth,
  isLoading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  setLoading: (loading) => {
    if (loading) {
      set({ isLoading: true, error: null });
      return;
    }

    set({ isLoading: false });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  clearAuth: () => {
    clearStoredAuth();
    set({ ...emptyAuth(), isLoading: false, error: null });
  },

  logout: () => {
    clearStoredAuth();
    set({ ...emptyAuth(), isLoading: false, error: null });
  },

  hydrateFromStorage: () => {
    set({ ...readStoredAuth(), isLoading: false, error: null });
  },
}));
