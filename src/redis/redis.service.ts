import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AssignmentStatus } from '../assignment/interfaces/assignment-status.interface';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    // Support both Redis URL and separate host/port configuration
    // Try REDIS_PUBLIC_URL first (for Railway external access), then REDIS_URL
    const redisUrl =
      this.configService.get<string>('REDIS_PUBLIC_URL') ||
      this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      // Use Redis URL (for Railway, Heroku, etc.)
      const isPublicUrl = this.configService.get<string>('REDIS_PUBLIC_URL');
      this.logger.log(
        `Connecting to Redis using ${isPublicUrl ? 'PUBLIC' : 'PRIVATE'} URL: ${redisUrl.substring(0, 8)}***`,
      );

      // Try different approaches for Railway compatibility
      try {
        // Approach 1: Parse URL and set family explicitly
        const parsedUrl = new URL(redisUrl);
        this.logger.log(`Parsed Redis URL - Host: ${parsedUrl.hostname}, Port: ${parsedUrl.port}`);

        this.redis = new Redis({
          host: parsedUrl.hostname,
          port: parseInt(parsedUrl.port) || 6379,
          username: parsedUrl.username || undefined,
          password: parsedUrl.password || undefined,
          family: 0, // Enable dual stack lookup (IPv4 and IPv6) for Railway support
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
        });
      } catch (parseError) {
        // Fallback: Use URL string with family parameter
        this.logger.warn('Failed to parse Redis URL, using string approach:', parseError);
        const urlWithFamily = redisUrl.includes('?')
          ? `${redisUrl}&family=0`
          : `${redisUrl}?family=0`;

        this.redis = new Redis(urlWithFamily, {
          family: 0,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
        });
      }
    } else {
      // Use separate host/port configuration (for local development)
      const host = this.configService.get<string>('REDIS_HOST', 'localhost');
      const port = this.configService.get<number>('REDIS_PORT', 6379);
      const db = this.configService.get<number>('REDIS_DB', 0);
      this.logger.log(`Connecting to Redis using host:port - ${host}:${port}, db: ${db}`);
      this.redis = new Redis({
        host,
        port,
        db,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }

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
