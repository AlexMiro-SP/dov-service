import { Module } from '@nestjs/common';
import { TemplateParameterValidationService } from './template-parameter-validation.service';
import { ValidateTemplateParametersPipe } from './validate-template-parameters.pipe';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TemplateParameterValidationService, ValidateTemplateParametersPipe],
  exports: [TemplateParameterValidationService, ValidateTemplateParametersPipe],
})
export class CommonModule {}
