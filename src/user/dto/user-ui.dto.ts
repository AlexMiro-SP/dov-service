import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsOptional, IsString } from 'class-validator';

export class UserUiDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserUiPaginatedDto {
  @ApiProperty({ type: [UserUiDto] })
  data: UserUiDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class UserUiQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by name (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by role (exact match)' })
  @IsOptional()
  @IsString()
  role?: string;
}
