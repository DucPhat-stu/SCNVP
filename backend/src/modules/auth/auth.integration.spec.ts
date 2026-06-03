import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalExceptionFilter } from '../../shared/filters/global-exception.filter';
import { TransformInterceptor } from '../../shared/interceptors/transform.interceptor';
import { AuthModule } from './auth.module';

type BcryptHashMock = jest.Mock<Promise<string>, [string, number]>;
type BcryptCompareMock = jest.Mock<Promise<boolean>, [string, string]>;

describe('Auth integration', () => {
  const createdUser = {
    id: 'user_1',
    email: 'engineer@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ENGINEER,
    experienceLevel: 'advanced',
    createdAt: new Date('2026-05-25T00:00:00.000Z'),
    updatedAt: new Date('2026-05-25T00:00:00.000Z'),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  let app: INestApplication;

  beforeEach(async () => {
    jest.resetAllMocks();

    const bcrypt = await import('bcryptjs');
    (jest.spyOn(bcrypt, 'hash') as unknown as BcryptHashMock).mockResolvedValue(
      createdUser.passwordHash,
    );
    (
      jest.spyOn(bcrypt, 'compare') as unknown as BcryptCompareMock
    ).mockResolvedValue(true);

    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdUser);
    prisma.user.create.mockResolvedValue(createdUser);

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-access-secret',
              JWT_REFRESH_SECRET: 'test-refresh-secret',
              JWT_EXPIRES_IN: '15m',
              JWT_REFRESH_EXPIRES_IN: '7d',
            }),
          ],
        }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers and then logs in with token responses', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'Engineer@Example.com',
        password: 'SecurePass123!',
        role: UserRole.ENGINEER,
        experienceLevel: 'advanced',
      })
      .expect(201);

    expect(registerResponse.body.data).toMatchObject({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: UserRole.ENGINEER,
      },
      token: expect.any(String),
      refreshToken: expect.any(String),
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'engineer@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(loginResponse.body.data.token).toEqual(expect.any(String));
    expect(loginResponse.body.data.refreshToken).toEqual(expect.any(String));
  });
});
