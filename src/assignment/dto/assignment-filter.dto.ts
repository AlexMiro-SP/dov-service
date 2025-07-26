import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
// Using string literal type instead of enum until Prisma Client is fully updated
type AssignmentStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED';

export class AssignmentFilterDto {
  @ApiProperty({
    description: 'Filter by snippet ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  snippetId?: string;

  @ApiProperty({
    description: 'Filter by category type',
    required: false,
  })
  @IsString()
  @IsOptional()
  catType?: string;

  @ApiProperty({
    description: 'Filter by assignment status',
    enum: ['PENDING', 'ACTIVE', 'FAILED', 'ARCHIVED'],
    required: false,
  })
  @IsEnum(['PENDING', 'ACTIVE', 'FAILED', 'ARCHIVED'])
  @IsOptional()
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Page number for pagination',
    default: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value as string))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    default: 20,
    required: false,
  })
  @Transform(({ value }) => parseInt(value as string))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
