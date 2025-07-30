import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { AssignmentHealthController } from './assignment-health.controller';
import { AssignmentQueueService } from './assignment-queue.service';
import { AssignmentWorkerService } from './assignment-worker.service';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule, RedisModule],
  controllers: [AssignmentController, AssignmentHealthController],
  providers: [AssignmentService, AssignmentQueueService, AssignmentWorkerService],
  exports: [AssignmentService, AssignmentQueueService],
})
export class AssignmentModule {}
