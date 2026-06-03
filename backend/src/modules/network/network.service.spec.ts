import { BadRequestException } from '@nestjs/common';
import { LinkType, NodeStatus, NodeType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService, RequestUser } from '../project/project.service';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  const user: RequestUser = {
    id: 'user_1',
    email: 'engineer@example.com',
    role: UserRole.ENGINEER,
  };

  const network = {
    id: 'network_1',
    projectId: 'project_1',
    metadata: {},
    nodes: [],
    connections: [],
  };

  const savedNetwork = {
    ...network,
    nodes: [
      {
        id: 'node_1',
        networkId: network.id,
        type: NodeType.EDGE_ROUTER,
        label: 'Edge Router',
        posX: 100,
        posY: 120,
        posZ: null,
        config: {},
        status: NodeStatus.ACTIVE,
        cost: null,
      },
      {
        id: 'node_2',
        networkId: network.id,
        type: NodeType.PUBLIC_WIFI,
        label: 'Public WiFi',
        posX: 240,
        posY: 120,
        posZ: null,
        config: {},
        status: NodeStatus.ACTIVE,
        cost: null,
      },
    ],
    connections: [
      {
        id: 'conn_1',
        networkId: network.id,
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

  const projectService = {
    assertProjectAccess: jest.fn(),
  };

  let service: NetworkService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.network.upsert.mockResolvedValue(network);
    service = new NetworkService(
      prisma as unknown as PrismaService,
      projectService as unknown as ProjectService,
    );
  });

  it('loads or creates an empty project network after ownership validation', async () => {
    const result = await service.getTopology(network.projectId, user);

    expect(projectService.assertProjectAccess).toHaveBeenCalledWith(
      network.projectId,
      user,
    );
    expect(prisma.network.upsert).toHaveBeenCalledWith({
      where: { projectId: network.projectId },
      update: {},
      create: {
        projectId: network.projectId,
        metadata: {},
      },
      include: {
        nodes: true,
        connections: true,
      },
    });
    expect(result).toEqual(network);
  });

  it('saves a full topology by replacing nodes and connections exactly', async () => {
    prisma.network.upsert
      .mockResolvedValueOnce(network)
      .mockResolvedValueOnce(savedNetwork);

    const result = await service.saveTopology(
      network.projectId,
      {
        nodes: [
          {
            id: 'node_1',
            type: NodeType.EDGE_ROUTER,
            label: 'Edge Router',
            posX: 100,
            posY: 120,
            status: NodeStatus.ACTIVE,
            config: {},
          },
          {
            id: 'node_2',
            type: NodeType.PUBLIC_WIFI,
            label: 'Public WiFi',
            posX: 240,
            posY: 120,
            status: NodeStatus.ACTIVE,
            config: {},
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
        metadata: { zoom: 1.1 },
      },
      user,
    );

    expect(transactionClient.connection.deleteMany).toHaveBeenCalledWith({
      where: { networkId: network.id },
    });
    expect(transactionClient.networkNode.deleteMany).toHaveBeenCalledWith({
      where: { networkId: network.id },
    });
    expect(transactionClient.networkNode.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'node_1', networkId: network.id }),
        expect.objectContaining({ id: 'node_2', networkId: network.id }),
      ]),
    });
    expect(transactionClient.connection.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          id: 'conn_1',
          networkId: network.id,
          sourceId: 'node_1',
          targetId: 'node_2',
        }),
      ],
    });
    expect(result.nodes).toHaveLength(2);
    expect(result.connections).toHaveLength(1);
  });

  it('rejects topology connections that reference missing submitted nodes', async () => {
    await expect(
      service.saveTopology(
        network.projectId,
        {
          nodes: [
            {
              id: 'node_1',
              type: NodeType.EDGE_ROUTER,
              label: 'Edge Router',
              posX: 100,
              posY: 120,
            },
          ],
          connections: [
            {
              id: 'conn_1',
              sourceId: 'node_1',
              targetId: 'missing_node',
            },
          ],
        },
        user,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
