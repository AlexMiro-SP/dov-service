import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AssignmentQueueService, BulkAssignmentData } from './assignment-queue.service';

@Injectable()
export class AssignmentWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AssignmentWorkerService.name);
  private readonly redis: Redis;
  private isRunning = false;
  private workerPromise: Promise<void> | null = null;

  constructor(
    private assignmentQueueService: AssignmentQueueService,
    private configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      db: this.configService.get('REDIS_DB', 0),
    });
  }

  async onModuleInit() {
    const enableWorker = this.configService.get('ENABLE_ASSIGNMENT_WORKER', 'true') === 'true';

    if (enableWorker) {
      this.startWorker();
    } else {
      this.logger.log('Assignment worker disabled by configuration');
    }
  }

  async onModuleDestroy() {
    await this.stopWorker();
    await this.redis.disconnect();
  }

  private startWorker() {
    if (this.isRunning) {
      this.logger.warn('Worker is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting assignment queue worker');

    this.workerPromise = this.processQueue();
  }

  private async stopWorker() {
    if (!this.isRunning) {
      return;
    }

    this.logger.log('Stopping assignment queue worker');
    this.isRunning = false;

    if (this.workerPromise) {
      await this.workerPromise;
    }
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        const result = await this.redis.brpop('assignment-queue', 5);

        if (result && result.length === 2) {
          const [, messageData] = result;
          await this.processMessage(messageData);
        }
      } catch (error) {
        this.logger.error('Error processing queue:', error);
        await this.sleep(1000);
      }
    }
  }

  private async processMessage(messageData: string): Promise<void> {
    try {
      const assignmentData: BulkAssignmentData = JSON.parse(messageData);
      this.logger.log(`Processing assignment: ${assignmentData.assignmentId}`);

      await this.assignmentQueueService.processAssignment(assignmentData);
    } catch (error) {
      this.logger.error('Failed to process assignment message:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getQueueStats() {
    const queueLength = await this.redis.llen('assignment-queue');

    return {
      queueLength,
      isWorkerRunning: this.isRunning,
    };
  }
}
