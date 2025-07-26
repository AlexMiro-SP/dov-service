import { Module } from '@nestjs/common';
import { SubSnippetService } from './sub-snippet.service';
import { SubSnippetController } from './sub-snippet.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SubSnippetController],
  providers: [SubSnippetService, PrismaService],
})
export class SubSnippetModule {}
