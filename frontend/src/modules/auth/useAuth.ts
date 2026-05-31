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

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (payload: LoginRequest) => {
    const result = await api.post<AuthTokens, AuthTokens>('/auth/login', payload);
    setAuth(result.user, result.token, result.refreshToken);
    return result.user;
  };

  const register = async (payload: RegisterRequest) => {
    const result = await api.post<AuthTokens, AuthTokens>(
      '/auth/register',
      payload,
    );
    setAuth(result.user, result.token, result.refreshToken);
    return result.user;
  };

  return { login, register };
}
