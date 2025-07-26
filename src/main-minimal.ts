import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Injectable } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import * as packageJson from '../package.json';

@Injectable()
class MinimalAppService {
  getHello(): string {
    return 'Hello World!';
  }

  getVersion() {
    return {
      version: packageJson.version,
      name: packageJson.name,
      description: packageJson.description || 'DOV Backend Service',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

@ApiTags('Application')
@Controller()
class MinimalAppController {
  constructor(private readonly appService: MinimalAppService) {}

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

@Module({
  controllers: [MinimalAppController],
  providers: [MinimalAppService],
})
class MinimalAppModule {}

async function bootstrap() {
  const app = await NestFactory.create(MinimalAppModule);

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('DOV Service API')
    .setDescription('DOV Backend Service API Documentation')
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
}

void bootstrap();
