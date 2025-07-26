import { Module } from '@nestjs/common';
import { TemplateParameterService } from './template-parameter.service';
import { TemplateParameterController } from './template-parameter.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateParameterValidationService } from '../common/template-parameter-validation.service';

@Module({
  controllers: [TemplateParameterController],
  providers: [TemplateParameterService, PrismaService, TemplateParameterValidationService],
  exports: [TemplateParameterValidationService],
})
export class TemplateParameterModule {}
