import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Network, NetworkNode, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService, RequestUser } from '../project/project.service';
import {
  ConnectionDto,
  NetworkNodeDto,
  SaveTopologyDto,
} from './dto/topology.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

type FullNetwork = Network & {
  nodes: NetworkNode[];
  connections: Connection[];
};

@Injectable()
export class NetworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectService: ProjectService,
  ) {}

  async getTopology(projectId: string, user: RequestUser): Promise<FullNetwork> {
    await this.projectService.assertProjectAccess(projectId, user);
    return this.getOrCreateNetwork(projectId);
  }

  async saveTopology(
    projectId: string,
    dto: SaveTopologyDto,
    user: RequestUser,
  ): Promise<FullNetwork> {
    await this.projectService.assertProjectAccess(projectId, user);
    const existingNetwork = await this.getOrCreateNetwork(projectId);
    this.assertConnectionEndpoints(dto);

    await this.prisma.$transaction(async (tx) => {
      await tx.connection.deleteMany({
        where: { networkId: existingNetwork.id },
      });
      await tx.networkNode.deleteMany({
        where: { networkId: existingNetwork.id },
      });

      if (dto.nodes.length > 0) {
        await tx.networkNode.createMany({
          data: dto.nodes.map((node) =>
            this.toNodeCreateManyInput(existingNetwork.id, node),
          ),
        });
      }

      if (dto.connections.length > 0) {
        await tx.connection.createMany({
          data: dto.connections.map((connection) =>
            this.toConnectionCreateManyInput(existingNetwork.id, connection),
          ),
        });
      }

      await tx.network.update({
        where: { id: existingNetwork.id },
        data: {
          metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    });

    return this.getOrCreateNetwork(projectId);
  }

  async createNode(
    projectId: string,
    dto: NetworkNodeDto,
    user: RequestUser,
  ): Promise<NetworkNode> {
    await this.projectService.assertProjectAccess(projectId, user);
    const network = await this.getOrCreateNetwork(projectId);

    return this.prisma.networkNode.create({
      data: this.toNodeCreateInput(network.id, dto),
    });
  }

  async updateNode(
    projectId: string,
    nodeId: string,
    dto: UpdateNodeDto,
    user: RequestUser,
  ): Promise<NetworkNode> {
    await this.projectService.assertProjectAccess(projectId, user);
    const network = await this.getOrCreateNetwork(projectId);
    await this.assertNodeBelongsToNetwork(network.id, nodeId);

    return this.prisma.networkNode.update({
      where: { id: nodeId },
      data: {
        type: dto.type,
        label: dto.label,
        posX: dto.posX,
        posY: dto.posY,
        posZ: dto.posZ,
        config: dto.config as Prisma.InputJsonValue | undefined,
        status: dto.status,
        cost: dto.cost,
      },
    });
  }

  async deleteNode(
    projectId: string,
    nodeId: string,
    user: RequestUser,
  ): Promise<null> {
    await this.projectService.assertProjectAccess(projectId, user);
    const network = await this.getOrCreateNetwork(projectId);
    await this.assertNodeBelongsToNetwork(network.id, nodeId);

    await this.prisma.$transaction([
      this.prisma.connection.deleteMany({
        where: {
          networkId: network.id,
          OR: [{ sourceId: nodeId }, { targetId: nodeId }],
        },
      }),
      this.prisma.networkNode.delete({ where: { id: nodeId } }),
    ]);

    return null;
  }

  async createConnection(
    projectId: string,
    dto: ConnectionDto,
    user: RequestUser,
  ): Promise<Connection> {
    await this.projectService.assertProjectAccess(projectId, user);
    const network = await this.getOrCreateNetwork(projectId);
    await this.assertNodesBelongToNetwork(network.id, [dto.sourceId, dto.targetId]);

    return this.prisma.connection.create({
      data: this.toConnectionCreateInput(network.id, dto),
    });
  }

  async deleteConnection(
    projectId: string,
    connectionId: string,
    user: RequestUser,
  ): Promise<null> {
    await this.projectService.assertProjectAccess(projectId, user);
    const network = await this.getOrCreateNetwork(projectId);
    const connection = await this.prisma.connection.findFirst({
      where: { id: connectionId, networkId: network.id },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    await this.prisma.connection.delete({ where: { id: connectionId } });
    return null;
  }

  private async getOrCreateNetwork(projectId: string): Promise<FullNetwork> {
    const network = await this.prisma.network.upsert({
      where: { projectId },
      update: {},
      create: {
        projectId,
        metadata: {},
      },
      include: {
        nodes: true,
        connections: true,
      },
    });

    return {
      ...network,
      nodes: network.nodes,
      connections: network.connections,
    };
  }

  private assertConnectionEndpoints(dto: SaveTopologyDto): void {
    const nodeIds = new Set(dto.nodes.map((node) => node.id).filter(Boolean));
    const invalidConnection = dto.connections.find(
      (connection) =>
        !nodeIds.has(connection.sourceId) || !nodeIds.has(connection.targetId),
    );

    if (invalidConnection) {
      throw new BadRequestException(
        'All connections must reference submitted topology nodes',
      );
    }
  }

  private async assertNodeBelongsToNetwork(
    networkId: string,
    nodeId: string,
  ): Promise<void> {
    const node = await this.prisma.networkNode.findFirst({
      where: { id: nodeId, networkId },
    });

    if (!node) {
      throw new NotFoundException('Node not found');
    }
  }

  private async assertNodesBelongToNetwork(
    networkId: string,
    nodeIds: string[],
  ): Promise<void> {
    const uniqueNodeIds = [...new Set(nodeIds)];
    const foundNodes = await this.prisma.networkNode.findMany({
      where: { networkId, id: { in: uniqueNodeIds } },
      select: { id: true },
    });

    if (foundNodes.length !== uniqueNodeIds.length) {
      throw new BadRequestException('Connection endpoints must exist');
    }
  }

  private toNodeCreateInput(
    networkId: string,
    node: NetworkNodeDto,
  ): Prisma.NetworkNodeCreateInput {
    return {
      id: node.id,
      network: { connect: { id: networkId } },
      type: node.type,
      label: node.label,
      posX: node.posX,
      posY: node.posY,
      posZ: node.posZ,
      config: (node.config ?? {}) as Prisma.InputJsonValue,
      status: node.status,
      cost: node.cost,
    };
  }

  private toNodeCreateManyInput(
    networkId: string,
    node: NetworkNodeDto,
  ): Prisma.NetworkNodeCreateManyInput {
    return {
      id: node.id,
      networkId,
      type: node.type,
      label: node.label,
      posX: node.posX,
      posY: node.posY,
      posZ: node.posZ,
      config: (node.config ?? {}) as Prisma.InputJsonValue,
      status: node.status,
      cost: node.cost,
    };
  }

  private toConnectionCreateInput(
    networkId: string,
    connection: ConnectionDto,
  ): Prisma.ConnectionCreateInput {
    return {
      id: connection.id,
      network: { connect: { id: networkId } },
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      bandwidth: connection.bandwidth,
      latency: connection.latency,
      linkType: connection.linkType ?? 'FIBER',
      cost: connection.cost,
    };
  }

  private toConnectionCreateManyInput(
    networkId: string,
    connection: ConnectionDto,
  ): Prisma.ConnectionCreateManyInput {
    return {
      id: connection.id,
      networkId,
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      bandwidth: connection.bandwidth,
      latency: connection.latency,
      linkType: connection.linkType ?? 'FIBER',
      cost: connection.cost,
    };
  }
}
