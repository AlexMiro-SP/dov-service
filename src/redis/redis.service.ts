import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AssignmentStatus } from '../assignment/interfaces/assignment-status.interface';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      db: this.configService.get('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', error => {
      this.logger.error('Redis connection error:', error);
    });
  }

  async setAssignmentStatus(assignmentId: string, status: AssignmentStatus): Promise<void> {
    const key = `assignment:${assignmentId}:status`;
    await this.redis.setex(key, 3600, JSON.stringify(status));
    this.logger.debug(`Set assignment status for ${assignmentId}: ${status.status}`);
  }

  async getAssignmentStatus(assignmentId: string): Promise<AssignmentStatus | null> {
    const key = `assignment:${assignmentId}:status`;
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as AssignmentStatus;
    } catch (error) {
      this.logger.error(`Failed to parse assignment status for ${assignmentId}:`, error);
      return null;
    }
  }

  async publishAssignmentToQueue(assignmentData: any): Promise<void> {
    const queueKey = 'assignment-queue';
    await this.redis.lpush(queueKey, JSON.stringify(assignmentData));
    const assignmentId =
      assignmentData && typeof assignmentData === 'object' && 'assignmentId' in assignmentData
        ? (assignmentData as { assignmentId: string }).assignmentId
        : 'unknown';
    this.logger.log(`Published assignment ${assignmentId} to queue`);
  }

  async getQueueLength(): Promise<number> {
    return await this.redis.llen('assignment-queue');
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
