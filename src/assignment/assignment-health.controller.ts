import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { AssignmentQueueService } from './assignment-queue.service';
import { AssignmentWorkerService } from './assignment-worker.service';
import { LocaleUtils } from '../common/utils/locale.utils';

@ApiTags('Assignment Health')
@Controller('assignment/health')
export class AssignmentHealthController {
  constructor(
    private redisService: RedisService,
    private assignmentQueueService: AssignmentQueueService,
    private assignmentWorkerService: AssignmentWorkerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check assignment system health' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
  })
  async checkHealth() {
    try {
      const queueStats = await this.assignmentWorkerService.getQueueStats();

      await this.redisService.setAssignmentStatus('health-test', {
        status: 'PENDING',
        timestamp: Date.now(),
      });

      const retrievedStatus = await this.redisService.getAssignmentStatus('health-test');

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        redis: {
          connected: true,
          canWrite: true,
          canRead: !!retrievedStatus,
        },
        queue: queueStats,
        django: {
          baseUrl: process.env.BACKEND_API_URL || 'not configured',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        redis: {
          connected: false,
        },
        queue: {
          queueLength: 0,
          isWorkerRunning: false,
        },
      };
    }
  }

  @Get('test-django')
  @ApiOperation({ summary: 'Test Django API connection' })
  @ApiResponse({
    status: 200,
    description: 'Django API test result',
  })
  async testDjangoConnection() {
    try {
      const testData = {
        snippetId: 'test-snippet',
        assignments: [{ catType: 'league', slugs: ['test-slug'] }],
        categoryTypes: ['Slim'],
        locale: 'en-GB',
      };

      console.log(
        'Testing with locale:',
        testData.locale,
        '-> Django format:',
        LocaleUtils.normalizeToDjango(testData.locale),
      );

      const result = await this.assignmentQueueService.previewAssignment(testData);

      return {
        status: 'success',
        djangoUrl: process.env.BACKEND_API_URL,
        response: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        djangoUrl: process.env.BACKEND_API_URL,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
