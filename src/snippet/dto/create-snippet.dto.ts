import { IsNotEmpty, IsString, ValidateNested, IsArray, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VariationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsInt()
  order: number;
}

export class ParagraphDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: [VariationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariationDto)
  variations: VariationDto[];
}

export class SubSnippetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  base: string;

  @ApiProperty({ type: [ParagraphDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParagraphDto)
  paragraphs: ParagraphDto[];
}

export class CreateSnippetDto {
  @ApiProperty({ example: 'Title of the snippet' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'en_GB' })
  @IsString()
  @IsNotEmpty()
  locale: string;

  @ApiProperty({ example: 'CTA' })
  @IsString()
  @IsNotEmpty()
  component: string;

  @ApiProperty({ type: SubSnippetDto })
  @ValidateNested()
  @Type(() => SubSnippetDto)
  slim: SubSnippetDto;

  @ApiProperty({ type: SubSnippetDto })
  @ValidateNested()
  @Type(() => SubSnippetDto)
  evergreen: SubSnippetDto;

  @ApiProperty({ type: SubSnippetDto })
  @ValidateNested()
  @Type(() => SubSnippetDto)
  dynamic: SubSnippetDto;
}
