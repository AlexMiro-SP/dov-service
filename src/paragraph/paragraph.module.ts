import { Module } from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { ParagraphController } from './paragraph.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ParagraphController],
  providers: [ParagraphService, PrismaService],
})
export class ParagraphModule {}
