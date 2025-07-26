import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsOptional, IsString } from 'class-validator';

export class TemplateParameterUiDto {
  id: string;
  code: string;
  uiCode: string;
  label?: string;
  description?: string;
}

export class TemplateParameterUiPaginatedDto {
  data: TemplateParameterUiDto[];
  total: number;
  page: number;
  limit: number;
}

export class TemplateParameterUiQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  uiCode?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
