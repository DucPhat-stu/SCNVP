import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Project, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

const projectWithTopology = Prisma.validator<Prisma.ProjectInclude>()({
  network: {
    include: {
      nodes: true,
      connections: true,
    },
  },
});

type ProjectWithTopology = Prisma.ProjectGetPayload<{
  include: typeof projectWithTopology;
}>;

type ProjectSummary = Project & {
  nodeCount: number;
  totalCost: number;
};

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, user: RequestUser): Promise<ProjectSummary> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        cityName: dto.cityName,
        scale: dto.scale,
        budget: dto.budget,
        ownerId: user.id,
        network: {
          create: {
            metadata: {},
          },
        },
      },
      include: projectWithTopology,
    });

    return this.toSummary(project);
  }

  async findAll(user: RequestUser): Promise<ProjectSummary[]> {
    const projects = await this.prisma.project.findMany({
      where: user.role === UserRole.ADMIN ? undefined : { ownerId: user.id },
      include: projectWithTopology,
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map((project) => this.toSummary(project));
  }

  async findOne(id: string, user: RequestUser): Promise<ProjectSummary> {
    const project = await this.findAccessibleProject(id, user);
    return this.toSummary(project);
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    user: RequestUser,
  ): Promise<ProjectSummary> {
    await this.assertProjectAccess(id, user);

    const project = await this.prisma.project.update({
      where: { id },
      data: dto,
      include: projectWithTopology,
    });

    return this.toSummary(project);
  }

  async remove(id: string, user: RequestUser): Promise<null> {
    await this.assertProjectAccess(id, user);
    await this.prisma.project.delete({ where: { id } });
    return null;
  }

  async assertProjectAccess(id: string, user: RequestUser): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role !== UserRole.ADMIN && project.ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private async findAccessibleProject(
    id: string,
    user: RequestUser,
  ): Promise<ProjectWithTopology> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectWithTopology,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role !== UserRole.ADMIN && project.ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private toSummary(project: ProjectWithTopology): ProjectSummary {
    const nodes = project.network?.nodes ?? [];
    const connections = project.network?.connections ?? [];
    const nodeCost = nodes.reduce((total, node) => total + (node.cost ?? 0), 0);
    const connectionCost = connections.reduce(
      (total, connection) => total + (connection.cost ?? 0),
      0,
    );

    const { network, ...projectFields } = project;

    return {
      ...projectFields,
      nodeCount: nodes.length,
      totalCost: nodeCost + connectionCost,
    };
  }
}
