import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  experienceLevel: string | null;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}
