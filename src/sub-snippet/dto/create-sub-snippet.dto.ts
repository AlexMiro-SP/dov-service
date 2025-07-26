import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VariationType } from '@prisma/client';

class CreateVariationNestedDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsInt()
  order: number;
}

class CreateParagraphNestedDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: [CreateVariationNestedDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationNestedDto)
  variations: CreateVariationNestedDto[];
}

export class CreateSubSnippetDto {
  @ApiProperty({ example: 'SLIM', enum: VariationType })
  @IsEnum(VariationType)
  type: VariationType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  base: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: [CreateParagraphNestedDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParagraphNestedDto)
  paragraphs: CreateParagraphNestedDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  snippetId: string;
}
