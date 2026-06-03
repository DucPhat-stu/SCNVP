import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

type BcryptHashMock = jest.Mock<Promise<string>, [string, number]>;
type BcryptCompareMock = jest.Mock<Promise<boolean>, [string, string]>;

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const config = {
    get: jest.fn(),
  };

  const user = {
    id: 'user_1',
    email: 'engineer@example.com',
    passwordHash: 'hash',
    role: UserRole.ENGINEER,
    experienceLevel: 'intermediate',
    createdAt: new Date('2026-05-25T00:00:00.000Z'),
    updatedAt: new Date('2026-05-25T00:00:00.000Z'),
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jwtService.signAsync
      .mockResolvedValueOnce('access.jwt')
      .mockResolvedValueOnce('refresh.jwt');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('hashes the password with 12 rounds and returns token pair', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash') as unknown as BcryptHashMock;
      hashSpy.mockResolvedValue('hash');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user);

      const result = await service.register({
        email: 'Engineer@Example.com ',
        password: 'SecurePass123!',
        role: UserRole.ENGINEER,
        experienceLevel: 'intermediate',
      });

      expect(hashSpy).toHaveBeenCalledWith('SecurePass123!', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'engineer@example.com',
          passwordHash: 'hash',
          role: UserRole.ENGINEER,
          experienceLevel: 'intermediate',
        },
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          experienceLevel: user.experienceLevel,
          createdAt: user.createdAt,
        },
        token: 'access.jwt',
        refreshToken: 'refresh.jwt',
      });
    });

    it('throws ConflictException for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        service.register({
          email: user.email,
          password: 'SecurePass123!',
          role: UserRole.ENGINEER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const compareSpy = jest.spyOn(
        bcrypt,
        'compare',
      ) as unknown as BcryptCompareMock;
      compareSpy.mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login({
        email: user.email,
        password: 'SecurePass123!',
      });

      expect(result.token).toBe('access.jwt');
      expect(result.refreshToken).toBe('refresh.jwt');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const compareSpy = jest.spyOn(
        bcrypt,
        'compare',
      ) as unknown as BcryptCompareMock;
      compareSpy.mockResolvedValue(false);
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: user.email, password: 'WrongPass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
