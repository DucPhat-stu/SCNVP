import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProjectModule } from '../project/project.module';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [NetworkController],
  providers: [NetworkService],
})
export class NetworkModule {}
