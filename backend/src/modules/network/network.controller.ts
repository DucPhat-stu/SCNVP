import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../project/project.service';
import {
  ConnectionDto,
  NetworkNodeDto,
  SaveTopologyDto,
} from './dto/topology.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NetworkService } from './network.service';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get()
  getTopology(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.getTopology(projectId, user);
  }

  @Put()
  saveTopology(
    @Param('projectId') projectId: string,
    @Body() dto: SaveTopologyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.saveTopology(projectId, dto, user);
  }

  @Post('nodes')
  createNode(
    @Param('projectId') projectId: string,
    @Body() dto: NetworkNodeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.createNode(projectId, dto, user);
  }

  @Put('nodes/:nodeId')
  updateNode(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateNodeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.updateNode(projectId, nodeId, dto, user);
  }

  @Delete('nodes/:nodeId')
  deleteNode(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.deleteNode(projectId, nodeId, user);
  }

  @Post('connections')
  createConnection(
    @Param('projectId') projectId: string,
    @Body() dto: ConnectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.createConnection(projectId, dto, user);
  }

  @Delete('connections/:connectionId')
  deleteConnection(
    @Param('projectId') projectId: string,
    @Param('connectionId') connectionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.networkService.deleteConnection(projectId, connectionId, user);
  }
}
