import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'scnvp-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      error: null,
    };
  }
}
