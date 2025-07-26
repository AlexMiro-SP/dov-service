import { Module } from '@nestjs/common';
import { CategoryTypeController } from './category-type.controller';
import { CategoryTypeService } from './category-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryTypeController],
  providers: [CategoryTypeService],
  exports: [CategoryTypeService],
})
export class CategoryTypeModule {}
