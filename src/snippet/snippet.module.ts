import { Module } from '@nestjs/common';
import { SnippetController } from './snippet.controller';
import { SnippetService } from './snippet.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SnippetController],
  providers: [SnippetService, PrismaService],
})
export class SnippetModule {}
