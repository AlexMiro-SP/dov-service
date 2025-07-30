import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  IsOptional,
  Matches,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class BulkAssignmentDto {
  @ApiProperty({
    description: 'Snippet ID to assign',
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
    description: 'Snippet variation types to assign (SLIM, EVERGREEN, DYNAMIC)',
    example: ['SLIM', 'EVERGREEN', 'DYNAMIC'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  snippetVariationTypes?: string[];

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

  @ApiProperty({
    description: 'Array of snippet variations to assign',
    example: [
      {
        title: 'Sample CTA',
        body: 'Buy tickets now for {{ category.name }}',
        type: 'CTA',
        chunk_id: 'legacy-chunk-id',
        snippet_id: 'native-snippet-id',
      },
    ],
  })
  @IsArray()
  @IsOptional() // Optional since dov-service fetches from DB based on snippetVariationTypes
  snippetVariations?: Array<{
    title: string;
    body: string;
    type: string;
    chunk_id?: string;
    snippet_id?: string;
  }>;

  @ApiProperty({
    description: 'Use Django-native assignment logic instead of legacy external chunk generator',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useNativeLogic?: boolean;

  @ApiProperty({
    description: 'Total number of categories from preview for accurate progress tracking',
    example: 12942,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalCategoriesCount?: number;
}
