import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@lib/api';
import { useAuthStore } from '@shared/store/authStore';
import type { AuthTokens } from '@shared/types';
import { UserRole } from '@shared/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  role: UserRole;
  experienceLevel?: string;
}

/** Extract a human-readable message from the API error envelope. */
function extractErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    error.error &&
    typeof error.error === 'object' &&
    'message' in error.error
  ) {
    return String(error.error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}

export function useAuth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const login = useCallback(
    async (payload: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.post<AuthTokens, AuthTokens>(
          '/auth/login',
          payload,
        );
        setAuth(result.user, result.token, result.refreshToken);
        return result.user;
      } catch (err) {
        const message = extractErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [setAuth, setLoading, setError],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.post<AuthTokens, AuthTokens>(
          '/auth/register',
          payload,
        );
        setAuth(result.user, result.token, result.refreshToken);
        return result.user;
      } catch (err) {
        const message = extractErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [setAuth, setLoading, setError],
  );

  const logout = useCallback(async () => {
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  return { login, register, logout, isLoading, error };
}
