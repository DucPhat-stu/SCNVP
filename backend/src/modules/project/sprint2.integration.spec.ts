import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
  LinkType,
  NodeStatus,
  NodeType,
  ProjectScale,
  ProjectStatus,
  UserRole,
} from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalExceptionFilter } from '../../shared/filters/global-exception.filter';
import { TransformInterceptor } from '../../shared/interceptors/transform.interceptor';
import { AuthModule } from '../auth/auth.module';
import { NetworkModule } from '../network/network.module';
import { ProjectModule } from './project.module';

describe('Sprint 2 project and network API integration', () => {
  const user = {
    id: 'user_1',
    email: 'engineer@example.com',
    role: UserRole.ENGINEER,
  };

  const project = {
    id: 'project_1',
    name: 'District 1 Network',
    description: 'Core rollout',
    cityName: 'Ho Chi Minh City',
    scale: ProjectScale.MEDIUM,
    budget: 50000,
    status: ProjectStatus.DRAFT,
    ownerId: user.id,
    createdAt: new Date('2026-06-03T00:00:00.000Z'),
    updatedAt: new Date('2026-06-03T00:00:00.000Z'),
    network: {
      id: 'network_1',
      projectId: 'project_1',
      metadata: {},
      nodes: [],
      connections: [],
    },
  };

  const savedNetwork = {
    id: 'network_1',
    projectId: project.id,
    metadata: { zoom: 1.2 },
    nodes: [
      {
        id: 'node_1',
        networkId: 'network_1',
        type: NodeType.EDGE_ROUTER,
        label: 'Edge Router',
        posX: 120,
        posY: 160,
        posZ: null,
        config: {},
        status: NodeStatus.ACTIVE,
        cost: null,
      },
      {
        id: 'node_2',
        networkId: 'network_1',
        type: NodeType.PUBLIC_WIFI,
        label: 'Public WiFi',
        posX: 300,
        posY: 160,
        posZ: null,
        config: {},
        status: NodeStatus.ACTIVE,
        cost: null,
      },
    ],
    connections: [
      {
        id: 'conn_1',
        networkId: 'network_1',
        sourceId: 'node_1',
        targetId: 'node_2',
        bandwidth: 1000,
        latency: null,
        linkType: LinkType.FIBER,
        cost: null,
      },
    ],
  };

  const transactionClient = {
    connection: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    networkNode: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    network: {
      update: jest.fn(),
    },
  };

  const prisma = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    network: {
      upsert: jest.fn(),
    },
    networkNode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    connection: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(
      (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    ),
  };

  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.project.create.mockResolvedValue(project);
    prisma.project.findMany.mockResolvedValue([project]);
    prisma.project.findUnique.mockResolvedValue(project);
    prisma.project.update.mockResolvedValue({ ...project, name: 'Updated' });
    prisma.project.delete.mockResolvedValue(project);
    prisma.network.upsert.mockResolvedValue(savedNetwork);

    token = new JwtService({ secret: 'test-access-secret' }).sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

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
        ProjectModule,
        NetworkModule,
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

  it('supports authenticated project CRUD endpoints', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: project.name,
        description: project.description,
        cityName: project.cityName,
        scale: project.scale,
        budget: project.budget,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({
          id: project.id,
          name: project.name,
          nodeCount: 0,
          totalCost: 0,
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(project.id);
      });

    await request(app.getHttpServer())
      .put(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.name).toBe('Updated');
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toBeNull();
      });
  });

  it('supports authenticated topology load and bulk save endpoints', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/projects/${project.id}/network`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.nodes).toHaveLength(2);
        expect(body.data.connections).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .put(`/api/v1/projects/${project.id}/network`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nodes: [
          {
            id: 'node_1',
            type: NodeType.EDGE_ROUTER,
            label: 'Edge Router',
            posX: 120,
            posY: 160,
          },
          {
            id: 'node_2',
            type: NodeType.PUBLIC_WIFI,
            label: 'Public WiFi',
            posX: 300,
            posY: 160,
          },
        ],
        connections: [
          {
            id: 'conn_1',
            sourceId: 'node_1',
            targetId: 'node_2',
            bandwidth: 1000,
            linkType: LinkType.FIBER,
          },
        ],
        metadata: { zoom: 1.2 },
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.nodes).toHaveLength(2);
        expect(body.data.connections).toHaveLength(1);
      });

    expect(transactionClient.networkNode.createMany).toHaveBeenCalled();
    expect(transactionClient.connection.createMany).toHaveBeenCalled();
  });
});
