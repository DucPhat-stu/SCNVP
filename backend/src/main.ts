import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ── Global prefix ─────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Security ──────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000'], // TODO: add production origin
    credentials: true,
  });

  // ── Validation ────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ── Start ─────────────────────────────────────
  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  logger.log(`🚀 Backend listening on http://localhost:${port}/api/v1`);
  logger.log(`📋 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
