import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { validateEnv } from './config/env.validation';
import { ProjectModule } from './modules/project/project.module';
import { NetworkModule } from './modules/network/network.module';

// Feature modules — uncomment as they are built
// import { AuthModule } from './modules/auth/auth.module';
// import { ProjectModule } from './modules/project/project.module';
// import { NetworkModule } from './modules/network/network.module';
// import { CostModule } from './modules/cost/cost.module';
// import { SimulationModule } from './modules/simulation/simulation.module';
// import { AiModule } from './modules/ai/ai.module';
// import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    NetworkModule,
    // CostModule,
    // SimulationModule,
    // AiModule,
    // NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
