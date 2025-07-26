import { PartialType } from '@nestjs/swagger';
import { CreateTemplateParameterDto } from './create-template-parameter.dto';

// Note: uiCode is intentionally omitted from update payloads; it is generated server-side from code.
export class UpdateTemplateParameterDto extends PartialType(CreateTemplateParameterDto) {}
