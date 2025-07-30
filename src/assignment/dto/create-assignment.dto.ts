import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateAssignmentItemDto {
  @ApiProperty({
    description: 'Category type code from Django catType table',
    example: 'league',
  })
  @IsString()
  @IsNotEmpty()
  catType: string;

  @ApiProperty({
    description: 'Array of slugs for this category type',
    example: ['main-league', 'secondary-league'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  slugs: string[];
}

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Snippet ID to assign',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  snippetId: string;

  @ApiProperty({
    description: 'Array of assignments (catType + slugs)',
    type: [CreateAssignmentItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  assignments: CreateAssignmentItemDto[];

  @ApiProperty({
    description: 'Category types for catType determination (optional)',
    example: ['performer', 'league'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryTypes?: string[];
}
