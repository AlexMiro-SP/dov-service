import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
// Using string literal type instead of enum until Prisma Client is fully updated
type AssignmentStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED';

export class UpdateAssignmentDto {
  @ApiProperty({
    description: 'New slug for the assignment',
    example: 'updated-league-banner',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Assignment status',
    enum: ['PENDING', 'ACTIVE', 'FAILED', 'ARCHIVED'],
    required: false,
  })
  @IsEnum(['PENDING', 'ACTIVE', 'FAILED', 'ARCHIVED'])
  @IsOptional()
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Sync metadata from Django',
    required: false,
  })
  @IsOptional()
  syncMetadata?: any;
}
