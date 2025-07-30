import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty, ArrayMinSize, Matches } from 'class-validator';

export class PreviewAssignmentDto {
  @ApiProperty({
    description: 'Snippet ID to preview assignment for',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  snippetId: string;

  @ApiProperty({
    description: 'Array of assignments (catType + slugs)',
    example: [{ catType: 'league', slugs: ['parent-slug-1', 'parent-slug-2'] }],
  })
  @IsArray()
  @ArrayMinSize(1)
  assignments: Array<{
    catType: string;
    slugs: string[];
  }>;

  @ApiProperty({
    description: 'Category types to filter (city, performer, league, etc.)',
    example: ['city', 'performer', 'league'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categoryTypes: string[];

  @ApiProperty({
    description: 'Locale for categories (dov-service format with dash)',
    example: 'en-GB',
    pattern: '^[a-z]{2}-[A-Z]{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]{2}-[A-Z]{2}$/, {
    message: 'Locale must be in format: en-GB (dov-service format with dash)',
  })
  locale: string;
}
