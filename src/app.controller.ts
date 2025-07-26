import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get application status' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('version')
  @ApiOperation({ summary: 'Get application version' })
  @ApiResponse({
    status: 200,
    description: 'Application version information',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        name: { type: 'string', example: 'dov-service' },
        description: { type: 'string', example: 'DOV Backend Service' },
        environment: { type: 'string', example: 'development' },
        timestamp: { type: 'string', example: '2025-01-25T19:55:00.000Z' },
      },
    },
  })
  getVersion() {
    return this.appService.getVersion();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-01-25T19:55:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
