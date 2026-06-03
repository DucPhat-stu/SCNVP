import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectScale, ProjectStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService, RequestUser } from './project.service';

describe('ProjectService', () => {
  const user: RequestUser = {
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
      nodes: [
        {
          id: 'node_1',
          networkId: 'network_1',
          type: 'EDGE_ROUTER',
          label: 'Edge Router',
          posX: 100,
          posY: 120,
          posZ: null,
          config: {},
          status: 'ACTIVE',
          cost: 1200,
        },
      ],
      connections: [
        {
          id: 'conn_1',
          networkId: 'network_1',
          sourceId: 'node_1',
          targetId: 'node_2',
          bandwidth: 1000,
          latency: 2,
          linkType: 'FIBER',
          cost: 300,
        },
      ],
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
  };

  let service: ProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectService(prisma as unknown as PrismaService);
  });

  it('creates projects with an empty network and returns dashboard summary data', async () => {
    prisma.project.create.mockResolvedValue(project);

    const result = await service.create(
      {
        name: project.name,
        description: project.description,
        cityName: project.cityName,
        scale: project.scale,
        budget: project.budget,
      },
      user,
    );

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: project.name,
        description: project.description,
        cityName: project.cityName,
        scale: project.scale,
        budget: project.budget,
        ownerId: user.id,
        network: { create: { metadata: {} } },
      },
      include: {
        network: {
          include: {
            nodes: true,
            connections: true,
          },
        },
      },
    });
    expect(result.nodeCount).toBe(1);
    expect(result.totalCost).toBe(1500);
  });

  it('lists only owned projects for non-admin users', async () => {
    prisma.project.findMany.mockResolvedValue([project]);

    const result = await service.findAll(user);

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { ownerId: user.id },
      include: {
        network: {
          include: {
            nodes: true,
            connections: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    expect(result).toHaveLength(1);
  });

  it('blocks access to another user project', async () => {
    prisma.project.findUnique.mockResolvedValue({
      ...project,
      ownerId: 'other_user',
    });

    await expect(service.findOne(project.id, user)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('returns not found for missing projects', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing_project', user)).rejects.toThrow(
      NotFoundException,
    );
  });
});
