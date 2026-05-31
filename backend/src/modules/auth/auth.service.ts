import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, AuthUser, JwtPayload } from './types/auth-user.type';

const PASSWORD_HASH_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
        experienceLevel: dto.experienceLevel,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.buildAuthResponse(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-access-secret',
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.config.get<string>('JWT_REFRESH_SECRET') ??
          'dev-refresh-secret',
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      }),
    ]);

    return {
      user: this.toAuthUser(user),
      token,
      refreshToken,
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      experienceLevel: user.experienceLevel,
      createdAt: user.createdAt,
    };
  }
}
