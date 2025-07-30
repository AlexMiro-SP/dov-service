import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface AssignmentStatus {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  progress?: {
    processed: number;
    total: number;
    failed: number;
  };
  results?: any;
  error?: string;
}

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
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(`Failed to parse assignment status for ${assignmentId}:`, error);
      return null;
    }
  }

  async publishAssignmentToQueue(assignmentData: any): Promise<void> {
    const queueKey = 'assignment-queue';
    await this.redis.lpush(queueKey, JSON.stringify(assignmentData));
    this.logger.log(`Published assignment ${assignmentData.assignmentId} to queue`);
  }

  async getQueueLength(): Promise<number> {
    return await this.redis.llen('assignment-queue');
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
  }
}
